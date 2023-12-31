import { describe, expect, test } from '@jest/globals';
import { MockSalesforceCli } from './__mocks__/mockSalesforceCli';
import { SalesforceOrg } from '../salesforceOrg';
import { OrgListUsersResult } from '../orgListUsersResult';
import { NULL_SF_ID, SalesforceId } from '../salesforceId';
import { generateDebugLogLevelOrGetExisting, generateDebugTraceFlag } from '../genDebugTraceFlag';
import { getCurrentUser } from '../getCurrentUser';
import { SalesforceLogLevel } from '../salesforceLogLevel';
import { LogType } from '../traceFlagSObject';
import { MockIDE } from './__mocks__/mockIntegratedDevelopmentEnvironment';

describe('generate debug trace flag', () => {

	let cli: MockSalesforceCli;
	let org: SalesforceOrg;
	let currentRunningUserId: SalesforceId;
	let ide: MockIDE;

	beforeEach(() => {
		cli = new MockSalesforceCli();
		org = new SalesforceOrg({
			alias: 'TestOrg',
			isActive: true
		});
		ide = new MockIDE();

		currentRunningUserId = SalesforceId.get('1234567890');

		cli.addUser({
			targetOrg: org,
			result: new OrgListUsersResult({
				users: [
					{
						alias: org,
						defaultMarker: '(A)',
						userId: currentRunningUserId,
						username : 'test.username'
					}
				]
			})
		});
	});

	it('should create a debug log level and trace flag for current running user', async () => {
		const user = await getCurrentUser({
			targetOrg: org,
			cli
		});

		await ide.withProgress(async (progressToken) => {
			await generateDebugTraceFlag({
				targetOrg: org,
				salesforceCli: cli,
				ide: ide,
				debugLogLevelApiName: 'TestDebugLogLevelName',
				progressToken: progressToken
			});
		}, {
			title: 'Test'
		});

		const debugLogLevels = await cli.dataQuery({
			targetOrg: org,
			query: {
				from: 'DebugLevel'
			}
		});

		expect(debugLogLevels.getSObjects()).toHaveLength(1);
		const debugLogLevel = debugLogLevels.getSObjects()[0];
		expect(debugLogLevel["ApexCode"]).toBe(SalesforceLogLevel.debug.toString());
		expect(debugLogLevel["Visualforce"]).toBe(SalesforceLogLevel.none.toString());

		const traceFlags = await cli.dataQuery({
			targetOrg: org,
			query: {
				from: 'TraceFlag'
			}
		});

		expect(traceFlags.getSObjects()).toHaveLength(1);
		const traceFlag = traceFlags.getSObjects()[0];
		expect(traceFlag["DebugLevelId"]).toEqual(debugLogLevel["Id"]);
		expect(SalesforceId.get(traceFlag["TracedEntityId"])).toBe(user?.userId);
		expect(traceFlag["LogType"]).toBe(LogType.developerLog.toString());
	});

	it("should reuse a debug log level if one already exists with the default zf name", async () => {
		const debugLogLevelApiName = 'TestDebugLogLevelName';

		const debugLogLevel = await generateDebugLogLevelOrGetExisting({
			targetOrg: org,
			cli: cli,
			ide: ide,
			debugLogLevelApiName
		});

		expect(debugLogLevel.id).not.toBe(NULL_SF_ID);

		await ide.withProgress(async (progressToken) => {
			await generateDebugTraceFlag({
				targetOrg: org,
				salesforceCli: cli,
				debugLogLevelApiName,
				ide: ide,
				progressToken
			});
		}, {
			title : 'Test'
		});

		const traceFlags = await cli.dataQuery({
			targetOrg: org,
			query: {
				from: 'TraceFlag'
			}
		});

		expect(traceFlags.getSObjects()).toHaveLength(1);
		const traceFlag = traceFlags.getSObjects()[0];
		expect(SalesforceId.get(traceFlag["DebugLevelId"])).toBe(debugLogLevel.id);
	});
});
