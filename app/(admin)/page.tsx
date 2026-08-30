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
  getSettledList,
  getStatus,
} from "./components/overview/overviewUtils";

export default function OverviewPage() {
  const [overview, setOverview] = useState<OverviewData>(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchOverview = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const results = await Promise.allSettled([
      projectAPI.getProjectAll(),
      portAPI.getPortAll(),
      databaseAPI.getDatabaseAll(),
      adminAPI.getAdminAll(),
      domainAPI.getDomainsAll(),
      ciCdAPI.getJobs(),
      vpsAPI.getVpsAll(),
    ]);

    setOverview({
      projects: getSettledList<ProjectItem>(results[0]),
      ports: getSettledList<PortItem>(results[1]),
      databases: getSettledList<DatabaseItem>(results[2]),
      admins: getSettledList<AdminItem>(results[3]),
      domains: getSettledList<DomainListItem>(results[4]),
      jobs: getSettledList<CiCdJobItem>(results[5]),
      vps: getSettledList<VpsVirtualMachine>(results[6]),
    });
    setLastUpdated(new Date().toISOString());
    setLoading(false);
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
        />
        <OverviewMetricCard
          label="Active ports"
          value={summary.activePorts}
          icon={FiActivity}
          tone="bg-[#eff6ff] text-[#2563eb]"
          href="/port"
        />
        <OverviewMetricCard
          label="Active databases"
          value={summary.activeDatabases}
          icon={FiDatabase}
          tone="bg-[#f0fdf4] text-[#16a34a]"
          href="/database"
        />
        <OverviewMetricCard
          label="Running VPS"
          value={summary.runningVps}
          icon={FiServer}
          tone="bg-[#f5f3ff] text-[#7c3aed]"
          href="/vps"
        />
      </section>

      <OverviewHealthSection
        overview={overview}
        runningVps={summary.runningVps}
        activeDomains={summary.activeDomains}
        failedJobs={summary.failedJobs}
        runningJobs={summary.runningJobs}
        lastUpdated={lastUpdated}
      />

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <OverviewDistributionChart
          title="Projects by type"
          items={projectDistribution}
          emptyText="No project data available"
        />
        <OverviewDistributionChart
          title="Ports by resource type"
          items={portDistribution}
          emptyText="No port data available"
        />
      </section>
    </div>
  );
}
