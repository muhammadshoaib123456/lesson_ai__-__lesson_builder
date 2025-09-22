"use client";

export default function SideText() {
  return (
    <div className="flex flex-col items-top w-full">
      <h1 className="text-left xl:text-4xl lg:text-3xl md:text-3xl text-3xl w-full">
        <span className="font-superBlack text-purple-primary">
          Lessn Builder
        </span>
      </h1>
      <p className="text-left xl:text-xl md:text-lg lg:text-sm text-purple-secondary w-full">
        Create interactive, accurate AI-powered lessons for engaged classrooms
      </p>
    </div>
  );
}