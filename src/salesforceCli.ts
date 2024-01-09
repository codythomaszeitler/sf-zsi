import { SalesforceOrg } from "./salesforceOrg";
import { JobId } from "./jobId";
import { ProjectDeployStartResult } from "./projectDeployStartResult";
import { ProjectDeployReportResult } from "./projectDeployReportResult";
import { ProjectDeployCancelResult } from "./projectDeployCancelResult";
import { Executor, ExecutorCommand, intoCliCommandString } from "./executor";
import { ProjectDeployResumeResult } from "./projectDeployResumeResult";
import { SObjectListResult } from "./sObjectListResult";
import { SObjectDescribeResult } from "./sObjectDescribeResult";
import { SObjectApiName } from "./sObjectApiName";
import { ApexRunResult } from "./apexRunResult";
import { DataCreateRecordResult as DataUpsertRecordResult } from "./dataCreateRecordResult";
import { UpsertableSObject } from "./upsertableSObject";
import { OrgListUsersResult } from "./orgListUsersResult";
import { SoqlQuery } from "./soqlQuery";
import { DataQueryResult } from "./dataQueryResult";
import { ApexGetLogResult } from "./apexGetLogResult";
import { ApexListLogResult } from "./apexListLogResult";
import { SalesforceId } from "./salesforceId";
import { ApexTestGetResult, ApexTestRunResult } from "./apexTestRunResult";
import { Uri } from "./uri";

export abstract class SalesforceCli {
    private readonly executor: Executor;
    private readonly env: Object;

    constructor(executor: Executor, proxy?: {}) {
        this.executor = executor;

        this.env = {
            ...process.env,
            ...proxy
        };
    }

    abstract getOrgList(): Promise<SalesforceOrg[]>;
    abstract getDefaultOrg(): Promise<SalesforceOrg | null>;
    abstract openOrg(alias: string): Promise<void>;

    abstract projectDeployStart(params: { targetOrg: SalesforceOrg; sourceDir? : Uri[]}): Promise<ProjectDeployStartResult>;
    abstract projectDeployReport(params: { jobId: JobId }): Promise<ProjectDeployReportResult>;
    abstract projectDeployResume(params: { jobId: JobId }): Promise<ProjectDeployResumeResult>;
    abstract projectDeployCancel(params: { jobId: JobId }): Promise<ProjectDeployCancelResult>;

    abstract sobjectList(params: {
        targetOrg: SalesforceOrg
    }): Promise<SObjectListResult>;
    abstract sobjectDescribe(params: {
        targetOrg: SalesforceOrg,
        sObjectApiName: SObjectApiName
    }): Promise<SObjectDescribeResult>;

    abstract apexRun(params: {
        targetOrg: SalesforceOrg,
        apexCode: string;
    }): Promise<ApexRunResult>;

    abstract dataUpsertRecord(params: {
        targetOrg: SalesforceOrg,
        sObject: UpsertableSObject;
    }): Promise<DataUpsertRecordResult>;

    abstract dataQuery(params: { targetOrg: SalesforceOrg; query: SoqlQuery }): Promise<DataQueryResult>;

    abstract orgListUsers(params: {
        targetOrg: SalesforceOrg,
    }): Promise<OrgListUsersResult>;

    abstract apexGetLog(params: {
        targetOrg: SalesforceOrg,
        numLogs?: number,
        logId?: SalesforceId,
        logDir: Uri
    }): Promise<ApexGetLogResult>;

    abstract apexListLog(params: {
        targetOrg: SalesforceOrg
    }): Promise<ApexListLogResult>;

    abstract apexTestRun(params: {
        targetOrg: SalesforceOrg;
        tests: string[]
    }): Promise<ApexTestRunResult>;

    abstract apexTestGet(params: {
        targetOrg: SalesforceOrg; testRunId: SalesforceId
    }): Promise<ApexTestGetResult>;

    protected async exec(command: ExecutorCommand): Promise<{ stdout: any }> {
        command.env = this.env;
        const { stdout } = await this.executor(command);
        if (!stdout) {
            throw new Error(intoCliCommandString(command) + ' did not return any output.');
        }

        return {
            stdout
        };
    }
}

