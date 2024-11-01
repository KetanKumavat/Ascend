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
      <div className="w-full flex md:justify-between justify-around items-center gap-2 ">
        <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 py-6">
          {projectTitle}
        </h1>
        <Button
          className=""
          onClick={() => setShowForm(!showForm)}
          variant={!showForm ? "default" : "destructive"}>
          {!showForm ? "Create New Sprint" : "Cancel"}
        </Button>
      </div>
      {showForm && (
        <Card className="pt-4 mb-4 bg-neutral-900/50 border border-neutral-800 rounded-lg shadow-lg">
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex gap-4 items-end">
              <div className="flex-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-300 mb-1">
                  Sprint Name
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  readOnly
                  className="bg-neutral-800 text-white"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-300 mb-1">
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
                          className={`w-full justify-start text-left font-normal bg-neutral-800 text-white ${
                            !dateRange && "text-muted-foreground"
                          }`}>
                          <CalendarIcon className="mr-2 h-4 w-4 text-lime-500" />
                          {dateRange.from && dateRange.to ? (
                            format(dateRange.from, "LLL dd, y") +
                            " - " +
                            format(dateRange.to, "LLL dd, y")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-full bg-neutral-900 border border-neutral-700 shadow-lg"
                        align="start">
                        <DayPicker
                          classNames={{
                            chevron: "fill-lime-500",
                            range_start: "bg-lime-500 text-white",
                            range_end: "bg-lime-500 text-white",
                            range_middle: "bg-lime-300 text-black",
                            day_button: "hover:bg-lime-400 p-3",
                            today: "text-lime-500 font-extrabold",
                            root: "bg-neutral-900 w-full ",
                            head: "w-full",
                            nav: "w-full flex justify-between",
                            caption: "w-full flex justify-center",
                            months: "w-full grid grid-cols-1 gap-4",
                            month: "w-full space-y-3",
                          }}
                          mode="range"
                          disabled={[{ before: new Date() }]}
                          selected={dateRange}
                          onSelect={(range) => {
                            if (range?.from && range?.to) {
                              setDateRange(range);
                              field.onChange(range);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={createSprintLoading}
                className="bg-lime-500 text-black hover:bg-lime-600 transition-all duration-300">
                {createSprintLoading ? "Creating..." : "Create Sprint"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
