import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const UserAvatar = ({ user }) => {
    console.log("Rendering UserAvatar for user:", user);
    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex items-center space-x-2 w-full">
            <Avatar className="h-6 w-6">
                <AvatarImage src={user?.imageUrl} alt={user?.name} />
                <AvatarFallback className="text-xs font-medium">
                    {getInitials(user?.name)}
                </AvatarFallback>
            </Avatar>
            <span className="text-xs text-neutral-300">
                {user ? user.name : "Unassigned"}
            </span>
        </div>
    );
};

export default UserAvatar;
