"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, addDays } from "date-fns";

import { sprintSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/useFetch";
import { createSprint } from "@/actions/sprints";

export default function SprintCreationForm({
    projectTitle,
    projectSubTitle,
    projectKey,
    projectId,
    sprintKey,
}) {
    const [showForm, setShowForm] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: new Date(),
        to: addDays(new Date(), 14),
    });
    const router = useRouter();

    const { loading: createSprintLoading, fn: createSprintFn } =
        useFetch(createSprint);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(sprintSchema),
        defaultValues: {
            name: `${projectKey}-${sprintKey}`,
            startDate: dateRange.from,
            endDate: dateRange.to,
        },
    });

    const onSubmit = async (data) => {
        await createSprintFn(projectId, {
            ...data,
            startDate: dateRange.from,
            endDate: dateRange.to,
        });
        setShowForm(false);
        router.refresh();
    };

    return (
        <>
            <div className="w-full flex justify-end items-center">
                <Button
                    onClick={() => setShowForm(!showForm)}
                    variant={!showForm ? "default" : "outline"}
                    className={!showForm 
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                        : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    }
                >
                    {!showForm ? "Create New Sprint" : "Cancel"}
                </Button>
            </div>
            {showForm && (
                <Card className="pt-4 mb-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-700/60 rounded-lg shadow-lg">
                    <CardContent>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                                Create New Sprint
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Set up a new sprint with timeline and goals for your project.
                            </p>
                        </div>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col gap-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex-1">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                                    >
                                        Sprint Name
                                    </label>
                                    <Input
                                        id="name"
                                        {...register("name")}
                                        readOnly
                                        className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Sprint Duration
                                    </label>
                                    <Controller
                                        control={control}
                                        name="dateRange"
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`w-full justify-start text-left font-normal bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                                            !dateRange &&
                                                            "text-muted-foreground"
                                                        }`}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                                        {dateRange.from &&
                                                        dateRange.to ? (
                                                            format(
                                                                dateRange.from,
                                                                "LLL dd, y"
                                                            ) +
                                                            " - " +
                                                            format(
                                                                dateRange.to,
                                                                "LLL dd, y"
                                                            )
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg"
                                                    align="start"
                                                >
                                                    <DayPicker
                                                        classNames={{
                                                            chevron:
                                                                "fill-blue-500",
                                                            range_start:
                                                                "bg-blue-500 text-white",
                                                            range_end:
                                                                "bg-blue-500 text-white",
                                                            range_middle:
                                                                "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100",
                                                            day_button:
                                                                "hover:bg-blue-100 dark:hover:bg-blue-900 p-3",
                                                            today: "text-blue-500 font-extrabold",
                                                            root: "bg-white dark:bg-neutral-900 w-full",
                                                            head: "w-full",
                                                            nav: "w-full flex justify-between",
                                                            caption:
                                                                "w-full flex justify-center",
                                                            months: "w-full grid grid-cols-1 gap-4",
                                                            month: "w-full space-y-3",
                                                        }}
                                                        mode="range"
                                                        disabled={[
                                                            { before: new Date() },
                                                        ]}
                                                        selected={dateRange}
                                                        onSelect={(range) => {
                                                            if (
                                                                range?.from &&
                                                                range?.to
                                                            ) {
                                                                setDateRange(range);
                                                                field.onChange(
                                                                    range
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                <Button
                                    type="submit"
                                    disabled={createSprintLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
                                >
                                    {createSprintLoading
                                        ? "Creating..."
                                        : "Create Sprint"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
