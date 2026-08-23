/** Build-time feature flags. Only the literal string "true" enables a flag. */
export const engineeringWorkflowV2 = process.env.NEXT_PUBLIC_ENGINEERING_WORKFLOW_V2 === 'true';
