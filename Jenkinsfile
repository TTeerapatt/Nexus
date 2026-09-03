pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    booleanParam(
      name: 'DEPLOY',
      defaultValue: true,
      description: 'Deploy ด้วย docker compose หลัง build สำเร็จ'
    )
    string(
      name: 'NEXT_PUBLIC_BACKEND_URL',
      defaultValue: 'https://trpgls.com/nexus/api/',
      description: 'Backend URL used by the browser (baked into Next.js at build time)'
    )
    string(
      name: 'NEXUS_PORT',
      defaultValue: '3002',
      description: 'พอร์ตบน VPS ที่ map ไป container (host:container → NEXUS_PORT:3002)'
    )
    string(
      name: 'WEBHOOK_URL',
      defaultValue: 'https://trpgls.com/nexus/api/webhook/jenkins',
      description: 'Nexus API webhook endpoint for live deploy status'
    )
    password(
      name: 'WEBHOOK_SECRET',
      defaultValue: '',
      description: 'Shared secret for X-Jenkins-Secret header'
    )
  }

  environment {
    COMPOSE_PROJECT_NAME = 'nexus'
    IMAGE_NAME = 'nexus-admin'
    NEXT_PUBLIC_BACKEND_URL = "${params.NEXT_PUBLIC_BACKEND_URL}"
    NEXUS_PORT = "${params.NEXUS_PORT}"
    WEBHOOK_URL = "${params.WEBHOOK_URL}"
    WEBHOOK_SECRET = "${params.WEBHOOK_SECRET}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build image') {
      steps {
        sh '''
          set -e
          export NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL}"
          export NEXUS_PORT="${NEXUS_PORT}"
          docker compose build nexus
        '''
      }
    }

    stage('Deploy') {
      when {
        expression { return params.DEPLOY == true }
      }
      steps {
        script {
          notifyDeployWebhook(
            'started',
            'in_progress',
            'Deploy',
            "Deploy started for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
          )
        }
        sh '''
          set -e
          export NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL}"
          export NEXUS_PORT="${NEXUS_PORT}"
          docker compose up -d --remove-orphans nexus
        '''
      }
    }

    stage('Health check') {
      when {
        expression { return params.DEPLOY == true }
      }
      steps {
        sh '''
          set -e
          echo "Waiting for Nexus on :${NEXUS_PORT}/nexus ..."
          for i in $(seq 1 30); do
            code="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${NEXUS_PORT}/nexus" || true)"
            if echo "$code" | grep -Eq '^[123]'; then
              echo "Nexus is healthy (HTTP $code)"
              exit 0
            fi
            if [ "$i" -eq 30 ]; then
              echo "Nexus health check failed (HTTP $code)"
              docker compose ps || true
              docker compose logs --tail=80 nexus || true
              exit 1
            fi
            sleep 2
          done
        '''
      }
    }
  }

  post {
    success {
      echo "nexus #${env.BUILD_NUMBER} succeeded → https://trpgls.com/nexus"
      script {
        notifyDeployWebhook(
          'finished',
          'success',
          'Deploy',
          "Deploy succeeded for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
      }
    }
    failure {
      echo "nexus #${env.BUILD_NUMBER} failed"
      sh 'docker compose ps || true'
      script {
        notifyDeployWebhook(
          'finished',
          'failed',
          'Deploy',
          "Deploy failed for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
      }
    }
  }
}

def notifyDeployWebhook(String phase, String status, String stageName, String message) {
  if (!env.WEBHOOK_URL?.trim() || !env.WEBHOOK_SECRET?.trim()) {
    echo 'Webhook skipped: WEBHOOK_URL or WEBHOOK_SECRET is empty'
    return
  }

  def payload = groovy.json.JsonOutput.toJson([
    jobName    : env.JOB_NAME,
    buildNumber: env.BUILD_NUMBER?.toInteger(),
    phase      : phase,
    status     : status,
    stage      : stageName,
    message    : message
  ])

  sh """
    set +e
    curl -sS -X POST '${env.WEBHOOK_URL}' \\
      -H 'Content-Type: application/json' \\
      -H 'X-Jenkins-Secret: ${env.WEBHOOK_SECRET}' \\
      --data '${payload}' \\
      --max-time 10
    exit 0
  """
}
