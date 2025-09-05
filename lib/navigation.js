export const getProjectNavigationItems = (projectId) => [
    {
        key: "overview",
        label: "Overview",
        href: `/project/${projectId}`,
        icon: "FolderIcon",
    },
    {
        key: "meetings",
        label: "Meetings", 
        href: `/project/${projectId}/meetings`,
        icon: "VideoIcon",
    },
    {
        key: "canvas",
        label: "Canvas",
        href: `/project/${projectId}/canvas`,
        icon: "Book",
    },
];

export const createProjectNavigation = (projectId, currentPage) => ({
    projectId,
    currentPage,
    items: getProjectNavigationItems(projectId),
});
