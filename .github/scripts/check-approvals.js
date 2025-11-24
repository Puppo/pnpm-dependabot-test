export default async ({ github, context, core }) => {
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

  const approvedReviews = reviews.filter(
    (review) => review.state === 'APPROVED',
  );
  const uniqueApprovers = new Set(
    approvedReviews.map((review) => review.user.login),
  );
  const approvalCount = uniqueApprovers.size;

  console.log(`Current Approvals: ${approvalCount}`);
  console.log(`Required Approvals: ${requiredApprovals}`);

  if (approvalCount < requiredApprovals) {
    core.setFailed(
      `This PR requires ${requiredApprovals} approval(s), but has ${approvalCount}.`,
    );
  } else {
    console.log('Approval requirement met.');
  }
};
