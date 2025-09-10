"use client";
import React, { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    getMessagesForProject,
    createMessage,
    getUserByClerkId,
} from "@/actions/message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClipLoader from "react-spinners/ClipLoader";
import { useUser } from "@clerk/nextjs";

const TeamChat = ({ projectId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [userId, setUserId] = useState(null);

    const scrollRef = useRef(null);
    const { user } = useUser();

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userData = await getUserByClerkId(user.id);
                setUserId(userData?.id);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        if (user && !userId) {
            fetchUserId();
        }
    }, [user, userId]);

    useEffect(() => {
        async function fetchMessages() {
            setIsLoading(true);
            try {
                const messagesData = await getMessagesForProject(projectId);
                setMessages(messagesData || []);
                setHasFetched(true);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        }

        if (isOpen && !hasFetched) {
            fetchMessages();
        }
    }, [projectId, isOpen, hasFetched]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            const newMessage = {
                content: message.trim(),
                projectId,
            };

            const savedMessage = await createMessage(projectId, newMessage);

            if (savedMessage) {
                setMessages((prevMessages) => [...prevMessages, savedMessage]);
                setMessage("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg bg-lime-500 hover:bg-lime-600 p-0 z-50"
            >
                <MessageCircle className="h-6 w-6 text-white" />
            </Button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 bg-neutral-900 rounded-lg shadow-lg border border-neutral-800 z-50 shadow-neutral-800/50">
                    <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                        <h3 className="font-semibold text-white">Team Chat</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-neutral-800"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4 text-neutral-400" />
                        </Button>
                    </div>

                    <ScrollArea className="h-[400px] p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-96">
                                <ClipLoader color="#84cc16" size={50} />
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-4">
                                {messages && messages.length > 0 ? (
                                    messages.map((msg) => {
                                        return (
                                            <div
                                                key={msg.id}
                                                className="flex flex-col"
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-1">
                                                        <div
                                                            className={`flex justify-between items-center bg-neutral-800 rounded-lg p-2 mb-2 py-4 ${
                                                                msg.userId ===
                                                                userId
                                                                    ? "border-l-4 border-lime-500"
                                                                    : "border-l-4 border-neutral-700"
                                                            }`}
                                                        >
                                                            <p className="text-lg text-neutral-300 flex items-center break-words">
                                                                {msg.content}
                                                            </p>
                                                            <div className="flex-shrink-0 text-right">
                                                                {msg.user && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarImage
                                                                                src={
                                                                                    msg
                                                                                        .user
                                                                                        ?.imageUrl
                                                                                }
                                                                                alt={
                                                                                    msg
                                                                                        .user
                                                                                        ?.name ||
                                                                                    "User"
                                                                                }
                                                                            />
                                                                            <AvatarFallback className="text-xs bg-neutral-600 text-neutral-200">
                                                                                {msg
                                                                                    .user
                                                                                    ?.name
                                                                                    ? msg.user.name
                                                                                          .split(
                                                                                              " "
                                                                                          )
                                                                                          .map(
                                                                                              (
                                                                                                  n
                                                                                              ) =>
                                                                                                  n[0]
                                                                                          )
                                                                                          .join(
                                                                                              ""
                                                                                          )
                                                                                          .toUpperCase()
                                                                                          .slice(
                                                                                              0,
                                                                                              2
                                                                                          )
                                                                                    : "?"}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <span className="text-xs text-neutral-400">
                                                                {msg.createdAt
                                                                    ? new Date(
                                                                          msg.createdAt
                                                                      ).toLocaleTimeString(
                                                                          [],
                                                                          {
                                                                              hour: "2-digit",
                                                                              minute: "2-digit",
                                                                          }
                                                                      )
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center text-neutral-500 py-4">
                                        No messages yet
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        )}
                    </ScrollArea>

                    <form
                        onSubmit={handleSendMessage}
                        className="p-4 border-t border-neutral-700"
                    >
                        <div className="flex space-x-2">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-neutral-800 border-neutral-700 text-white focus:ring-lime-500"
                                maxLength={500}
                            />
                            <Button
                                type="submit"
                                size="sm"
                                className="bg-lime-500 hover:bg-lime-600 px-4"
                                disabled={!message.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default TeamChat;
