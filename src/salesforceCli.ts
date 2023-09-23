import { SalesforceOrg } from "./salesforceOrg";
import { JobId } from "./jobId";
import { ProjectDeployStartResult } from "./projectDeployStartResult";
import { ProjectDeployReportResult } from "./projectDeployReportResult";
import { ProjectDeployCancelResult } from "./projectDeployCancelResult";
import { Executor, ExecutorCommand } from "./executor";
import { ProjectDeployResumeResult } from "./projectDeployResumeResult";

export abstract class SalesforceCli {
    private readonly executor: Executor;

    constructor(executor: Executor) {
        this.executor = executor;
    }

    abstract getOrgList(): Promise<SalesforceOrg[]>;
    abstract getDefaultOrg(): Promise<SalesforceOrg | null>;
    abstract openOrg(alias: string): Promise<void>;

    abstract projectDeployStart(params: { targetOrg: SalesforceOrg; }): Promise<ProjectDeployStartResult>;
    abstract projectDeployReport(params: { jobId: JobId }): Promise<ProjectDeployReportResult>;
    abstract projectDeployResume(params: { jobId: JobId }): Promise<ProjectDeployResumeResult>;
    abstract projectDeployCancel(params: { jobId: JobId }): Promise<ProjectDeployCancelResult>;

    protected async exec(command: ExecutorCommand): Promise<{ stdout: any }> {
        const { stdout } = await this.executor(command);
        if (!stdout) {
            throw new Error(command + ' did not return any output.');
        }

        return {
            stdout
        };
    }
}

