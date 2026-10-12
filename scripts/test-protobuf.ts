import {
	IngestJobsRequest,
	type ScrapedJob,
} from '../src/generated/grpc/ingestion/v1/job-ingestion.ts';

const job: ScrapedJob = {
	externalId: 'job-1001',
	sourceUrl: 'https://example.com/jobs/1001',
	title: 'Backend Developer',
	companyName: 'Example Company',
	description: 'We are hiring a backend developer.',
	location: 'Remote',
	applicationUrl: ['https://example.com/apply/1001'],
};

const request: IngestJobsRequest = {
	sourceId: 'example',
	jobs: [job],
};

// JavaScript object -> Protobuf binary
const binary = IngestJobsRequest.encode(request).finish();

console.log('Encoded binary:', binary);
console.log('Binary size:', binary.length, 'bytes');

// Protobuf binary -> JavaScript object
const decoded = IngestJobsRequest.decode(binary);

console.log('Decoded message:', decoded);
