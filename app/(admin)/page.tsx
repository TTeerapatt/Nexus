"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiActivity, FiDatabase, FiFolder, FiServer } from "react-icons/fi";
import adminAPI, { type AdminItem } from "@/app/services/admin/adminAPI";
import ciCdAPI, { type CiCdJobItem } from "@/app/services/ciCd/ciCdAPI";
import databaseAPI, {
  type DatabaseItem,
} from "@/app/services/database/databaseAPI";
import domainAPI, {
  type DomainListItem,
} from "@/app/services/domain/domainAPI";
import portAPI, { type PortItem } from "@/app/services/port/portAPI";
import projectAPI, {
  type ProjectItem,
} from "@/app/services/project/projectAPI";
import vpsAPI, {
  type VpsVirtualMachine,
} from "@/app/services/vps/vpsAPI";
import OverviewDistributionChart from "./components/overview/OverviewDistributionChart";
import OverviewHeader from "./components/overview/OverviewHeader";
import OverviewHealthSection from "./components/overview/OverviewHealthSection";
import OverviewMetricCard from "./components/overview/OverviewMetricCard";
import {
  EMPTY_OVERVIEW,
  type DistributionItem,
  type OverviewData,
} from "./components/overview/overviewTypes";
import {
  getStatus,
  readList,
} from "./components/overview/overviewUtils";

type OverviewLoadingState = {
  projects: boolean;
  ports: boolean;
  databases: boolean;
  admins: boolean;
  domains: boolean;
  jobs: boolean;
  vps: boolean;
};

const INITIAL_LOADING_STATE: OverviewLoadingState = {
  projects: true,
  ports: true,
  databases: true,
  admins: true,
  domains: true,
  jobs: true,
  vps: true,
};

export default function OverviewPage() {
  const [overview, setOverview] = useState<OverviewData>(EMPTY_OVERVIEW);
  const [loadingSections, setLoadingSections] =
    useState<OverviewLoadingState>(INITIAL_LOADING_STATE);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchOverview = useCallback(async (isRefresh = false) => {
    setRefreshing(isRefresh);
    setLoadingSections(INITIAL_LOADING_STATE);

    const loadSection = async <T,>(
      key: keyof OverviewLoadingState,
      request: Promise<unknown>
    ) => {
      try {
        const result = await request;
        setOverview((current) => ({
          ...current,
          [key]: readList<T>(result),
        }));
      } catch {
        setOverview((current) => ({
          ...current,
          [key]: [],
        }));
      } finally {
        setLoadingSections((current) => ({ ...current, [key]: false }));
      }
    };

    await Promise.all([
      loadSection<ProjectItem>("projects", projectAPI.getProjectAll()),
      loadSection<PortItem>("ports", portAPI.getPortAll()),
      loadSection<DatabaseItem>("databases", databaseAPI.getDatabaseAll()),
      loadSection<AdminItem>("admins", adminAPI.getAdminAll()),
      loadSection<DomainListItem>("domains", domainAPI.getDomainsAll()),
      loadSection<CiCdJobItem>("jobs", ciCdAPI.getJobs()),
      loadSection<VpsVirtualMachine>("vps", vpsAPI.getVpsAll()),
    ]);
    setLastUpdated(new Date().toISOString());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    // Initial data loading is intentionally triggered from this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchOverview();
  }, [fetchOverview]);

  const summary = useMemo(() => {
    const runningVps = overview.vps.filter(
      (vm) => getStatus(vm.state) === "running"
    ).length;
    const failedJobs = overview.jobs.filter((job) =>
      ["failed", "unstable"].includes(getStatus(job.status))
    ).length;
    const runningJobs = overview.jobs.filter(
      (job) => getStatus(job.status) === "running"
    ).length;
    const activeDomains = overview.domains.filter((domain) =>
      ["active", "registered", "ok"].includes(getStatus(domain.status))
    ).length;

    return {
      activeProjects: overview.projects.filter((item) => item.is_active).length,
      activePorts: overview.ports.filter((item) => item.is_active).length,
      activeDatabases: overview.databases.filter((item) => item.is_active).length,
      runningVps,
      failedJobs,
      runningJobs,
      activeDomains,
    };
  }, [overview]);

  const projectDistribution = useMemo<DistributionItem[]>(() => {
    const projectCount = overview.projects.filter(
      (item) => getStatus(item.type) === "project"
    ).length;
    const serviceCount = overview.projects.filter(
      (item) => getStatus(item.type) === "service"
    ).length;

    return [
      { label: "Project", value: projectCount, color: "bg-[#0891b2]" },
      { label: "Service", value: serviceCount, color: "bg-[#e11d48]" },
    ].filter((item) => item.value > 0);
  }, [overview.projects]);

  const portDistribution = useMemo<DistributionItem[]>(() => {
    const colors = [
      "bg-[#2563eb]",
      "bg-[#d97706]",
      "bg-[#16a34a]",
      "bg-[#7c3aed]",
    ];
    const counts = new Map<string, number>();

    for (const port of overview.ports) {
      const label = port.resource_type_name || port.resource_type_code || "Other";
      counts.set(label, (counts.get(label) || 0) + 1);
    }

    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([label, value], index) => ({
        label,
        value,
        color: colors[index % colors.length],
      }));
  }, [overview.ports]);

  const loading = Object.values(loadingSections).some(Boolean);

  return (
    <div className="space-y-5">
      <OverviewHeader
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => void fetchOverview(true)}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewMetricCard
          label="Active projects"
          value={summary.activeProjects}
          icon={FiFolder}
          tone="bg-[#ecfeff] text-[#0e7490]"
          href="/projects"
          loading={loadingSections.projects}
        />
        <OverviewMetricCard
          label="Active ports"
          value={summary.activePorts}
          icon={FiActivity}
          tone="bg-[#eff6ff] text-[#2563eb]"
          href="/port"
          loading={loadingSections.ports}
        />
        <OverviewMetricCard
          label="Active databases"
          value={summary.activeDatabases}
          icon={FiDatabase}
          tone="bg-[#f0fdf4] text-[#16a34a]"
          href="/database"
          loading={loadingSections.databases}
        />
        <OverviewMetricCard
          label="Running VPS"
          value={summary.runningVps}
          icon={FiServer}
          tone="bg-[#f5f3ff] text-[#7c3aed]"
          href="/vps"
          loading={loadingSections.vps}
        />
      </section>

      <OverviewHealthSection
        overview={overview}
        runningVps={summary.runningVps}
        activeDomains={summary.activeDomains}
        failedJobs={summary.failedJobs}
        runningJobs={summary.runningJobs}
        lastUpdated={lastUpdated}
        loading={{
          vps: loadingSections.vps,
          jobs: loadingSections.jobs,
          domains: loadingSections.domains,
          admins: loadingSections.admins,
        }}
      />

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <OverviewDistributionChart
          title="Projects by type"
          items={projectDistribution}
          emptyText="No project data available"
          loading={loadingSections.projects}
        />
        <OverviewDistributionChart
          title="Ports by resource type"
          items={portDistribution}
          emptyText="No port data available"
          loading={loadingSections.ports}
        />
      </section>
    </div>
  );
}
