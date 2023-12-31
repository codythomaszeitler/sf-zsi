import { UpsertableSObject } from "./upsertableSObject";
import { NULL_SF_ID, SalesforceId } from "./salesforceId";

export interface TraceFlagSObject extends UpsertableSObject {
	readonly debugLevelId: SalesforceId;
	readonly expirationDate: Date;
	readonly logType: LogType;
	readonly startDate?: Date;
	readonly tracedEntityId: SalesforceId;
}

export class TraceFlagSObjectBuilder {
	private id?: SalesforceId;
	private debugLevelId?: SalesforceId;
	private expirationDate?: Date;
	private logType?: LogType;
	private startDate?: Date;
	private tracedEntityId?: SalesforceId;

	public withLogType(logType: LogType): TraceFlagSObjectBuilder {
		this.logType = logType;
		return this;
	}

	public withDebugLevelId(debugLevelId: SalesforceId): TraceFlagSObjectBuilder {
		this.debugLevelId = debugLevelId;
		return this;
	}

	public withExpirationDate(expirationDate: Date): TraceFlagSObjectBuilder {
		this.expirationDate = expirationDate;
		return this;
	}

	public withStartDate(startDate: Date): TraceFlagSObjectBuilder {
		this.startDate = startDate;
		return this;
	}

	public withTracedEntityId(tracedEntityId: SalesforceId): TraceFlagSObjectBuilder {
		this.tracedEntityId = tracedEntityId;
		return this;
	}

	public withId(id: string): TraceFlagSObjectBuilder {
		this.id = id;
		return this;
	}

	public build(): TraceFlagSObject {
		return {
			id: this.id || NULL_SF_ID,
			debugLevelId: this.debugLevelId || NULL_SF_ID,
			expirationDate: this.expirationDate || new Date(Date.now()),
			logType: this.logType || LogType.developerLog,
			startDate: this.startDate,
			tracedEntityId: this.tracedEntityId || NULL_SF_ID,
			getSObjectName(): string {
				return 'TraceFlag';
			},
			intoKeyValueString(): string {
				return intoKeyValueString(this);
			},
		};
	}
}

export function intoKeyValueString(traceFlagSObject : TraceFlagSObject) : string {
	return intoKeyValueStrings(traceFlagSObject).join(" ");
}

export function intoKeyValueStrings(traceFlagSObject: TraceFlagSObject): string[] {
	const keyValuePairs: string[] = [];

	if (traceFlagSObject.debugLevelId) {
		keyValuePairs.push(`DebugLevelId=${traceFlagSObject.debugLevelId}`);
	}

	keyValuePairs.push(`LogType=${traceFlagSObject.logType}`);

	if (traceFlagSObject.tracedEntityId) {
		keyValuePairs.push(`TracedEntityId=${traceFlagSObject.tracedEntityId}`);
	}

	if (traceFlagSObject.startDate) {
		keyValuePairs.push(`StartDate=${traceFlagSObject.startDate.toISOString()}`);
	}

	keyValuePairs.push(`ExpirationDate=${traceFlagSObject.expirationDate.toISOString()}`);

	return keyValuePairs;
}

export class LogType {

	public static readonly classTracing: LogType = new LogType("CLASS_TRACING");
	public static readonly developerLog: LogType = new LogType("DEVELOPER_LOG");
	public static readonly profiling: LogType = new LogType("PROFILING");
	public static readonly userDebug: LogType = new LogType("USER_DEBUG");

	private readonly raw: string;

	private constructor(raw: string) {
		this.raw = raw;
	}

	public toString() {
		return this.raw;
	}
}