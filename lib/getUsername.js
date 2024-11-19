export function getUsernameFromRepoUrl(repoUrl) {
  try {
    // console.log("repoUrl", repoUrl);
    const urlParts = new URL(repoUrl).pathname.split("/");
    // console.log("urlParts", urlParts[1]);
    return urlParts[1];
  } catch (error) {
    console.error("Invalid repo URL", error);
    return null;
  }
}
