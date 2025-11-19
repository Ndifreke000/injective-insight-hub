import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchGovernanceProposals, fetchMetrics, GovernanceProposal, MetricsData } from "@/lib/rpc";
import { Vote, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Governance() {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [proposalsData, metricsData] = await Promise.all([
        fetchGovernanceProposals(),
        fetchMetrics()
      ]);
      setProposals(proposalsData);
      setMetrics(metricsData);
    };

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics || proposals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading governance data...</div>
      </div>
    );
  }

  const activeProposals = proposals.filter(p => p.status === "active").length;
  const passedProposals = proposals.filter(p => p.status === "passed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Governance</h1>
        <p className="text-muted-foreground">DAO proposals and voting activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Proposals"
          value={proposals.length}
          icon={Vote}
          change="All time"
          trend="neutral"
        />
        <MetricCard
          title="Active Proposals"
          value={activeProposals}
          icon={Clock}
          change="Currently voting"
          trend="up"
        />
        <MetricCard
          title="Passed Proposals"
          value={passedProposals}
          icon={CheckCircle}
          change={`${((passedProposals / proposals.length) * 100).toFixed(0)}% success rate`}
          trend="up"
        />
        <MetricCard
          title="Active Validators"
          value={metrics.activeValidators}
          icon={Vote}
          change="Participating in governance"
          trend="neutral"
        />
      </div>

      {/* Proposals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Votes For</TableHead>
                  <TableHead>Votes Against</TableHead>
                  <TableHead>Participation</TableHead>
                  <TableHead>End Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal, index) => {
                  const votesFor = parseFloat(proposal.votesFor);
                  const votesAgainst = parseFloat(proposal.votesAgainst);
                  const totalVotes = votesFor + votesAgainst;
                  const participation = (totalVotes / parseFloat(metrics!.totalStaked)) * 100;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">#{proposal.id}</TableCell>
                      <TableCell>{proposal.title}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            proposal.status === "active" ? "bg-primary" :
                            proposal.status === "passed" ? "bg-success" :
                            "bg-destructive"
                          }
                        >
                          {proposal.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-success">
                        {(votesFor / 1000000).toFixed(2)}M
                      </TableCell>
                      <TableCell className="text-destructive">
                        {(votesAgainst / 1000000).toFixed(2)}M
                      </TableCell>
                      <TableCell>{participation.toFixed(2)}%</TableCell>
                      <TableCell className="text-xs">
                        {new Date(proposal.endTime).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Voting Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Voting Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposals.slice(0, 5).map((proposal, index) => {
                const votesFor = parseFloat(proposal.votesFor);
                const votesAgainst = parseFloat(proposal.votesAgainst);
                const totalVotes = votesFor + votesAgainst;
                const forPercentage = (votesFor / totalVotes) * 100;
                
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Proposal #{proposal.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {forPercentage.toFixed(1)}% for
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                      <div
                        className="bg-success"
                        style={{ width: `${forPercentage}%` }}
                      />
                      <div
                        className="bg-destructive"
                        style={{ width: `${100 - forPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governance Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Participation Rate</span>
              <span className="text-sm font-medium">42.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Voting Period</span>
              <span className="text-sm font-medium">7 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pass Threshold</span>
              <span className="text-sm font-medium">66.7%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Quorum Requirement</span>
              <span className="text-sm font-medium">40%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Voters</span>
              <span className="text-sm font-medium">8,942</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validator Voting Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Validator Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Validators Voted on Active Proposals</span>
              <span className="text-sm font-medium">{Math.floor(metrics.activeValidators * 0.85)} / {metrics.activeValidators}</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "85%" }} />
            </div>
            <p className="text-xs text-muted-foreground">
              85% of active validators have participated in recent governance votes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
