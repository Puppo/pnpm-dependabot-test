export default async ({ github, context }) => {
  const prPayload =
    context.payload.pull_request || context.payload.review.pull_request;

  // Fetch full PR details to ensure we have latest labels
  const { data: pr } = await github.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prPayload.number,
  });

  const author = pr.user.login;
  const labels = pr.labels.map((l) => l.name);

  console.log(`PR Author: ${author}`);
  console.log(`PR Labels: ${JSON.stringify(labels)}`);

  // Determine required approvals
  let requiredApprovals = 2; // Default for humans

  if (author === 'dependabot[bot]' || author.includes('dependabot')) {
    if (labels.includes('semver:major')) {
      console.log(
        'Dependabot PR includes major upgrade. Requiring 2 approvals.',
      );
      requiredApprovals = 2;
    } else {
      console.log('Dependabot PR (minor/patch). Requiring 1 approval.');
      requiredApprovals = 1;
    }
  } else {
    console.log('Human PR. Requiring 2 approvals.');
  }

  // Count approvals
  const { data: reviews } = await github.rest.pulls.listReviews({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr.number,
  });

  // Only count the latest review from each reviewer, and only if it's APPROVED
  const latestReviews = new Map();
  reviews.forEach((review) => {
    const existing = latestReviews.get(review.user.login);
    if (
      !existing ||
      new Date(review.submitted_at) > new Date(existing.submitted_at)
    ) {
      latestReviews.set(review.user.login, review);
    }
  });
  const approvedReviews = Array.from(latestReviews.values()).filter(
    (review) => review.state === 'APPROVED' && review.user.login !== author,
  );
  const approvalCount = approvedReviews.length;

  console.log(`Current Approvals: ${approvalCount}`);
  console.log(`Required Approvals: ${requiredApprovals}`);

  // Create a unified status check instead of failing the workflow
  // This prevents duplicate checks from appearing for different events (pull_request vs pull_request_review)
  const state = approvalCount < requiredApprovals ? 'failure' : 'success';
  const description =
    approvalCount < requiredApprovals
      ? `Requires ${requiredApprovals} approval(s), has ${approvalCount}.`
      : 'Approval requirement met.';

  await github.rest.repos.createCommitStatus({
    owner: context.repo.owner,
    repo: context.repo.repo,
    sha: pr.head.sha,
    state,
    description,
    context: 'Review Policy',
  });

  if (state === 'failure') {
    console.log(`Check failed: ${description}`);
    // We intentionally do NOT call core.setFailed() here.
    // This allows the workflow to pass, while the "Review Policy" status check (created above) will fail.
    // This ensures you have a single, consistent status check to use for branch protection.
  } else {
    console.log('Approval requirement met.');
  }
};
