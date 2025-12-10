import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FAMILY_AUTH_HEADERS, truncateInline } from "./dashboard-utils";

type DescriptionEditorProps = {
  transactionId: string;
  value: string;
  onSaved: (description: string | null) => void;
};

type DescriptionFormValues = {
  description: string;
};

export function DescriptionEditor({
  transactionId,
  value,
  onSaved,
}: DescriptionEditorProps) {
  const { register, handleSubmit, reset } =
    useForm<DescriptionFormValues>({
      defaultValues: { description: value ?? "" },
    });
  const [status, setStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    reset({ description: value ?? "" }, { keepDirty: false });
  }, [reset, value]);

  const onSubmit = handleSubmit(async (data) => {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const response = await fetch(
        `/api/transactions/${transactionId}/description`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...FAMILY_AUTH_HEADERS,
          },
          body: JSON.stringify({ description: data.description }),
        },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        transaction?: { description?: string | null };
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to update description");
      }
      const nextDescription = payload.transaction?.description ?? null;
      onSaved(nextDescription);
      reset({ description: nextDescription ?? "" }, { keepDirty: false });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
      setIsEditing(false);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update description",
      );
    }
  });

  const readOnlyView = (
    <button
      type="button"
      className="group flex min-h-[1.75rem] w-full items-center rounded border border-transparent px-2 text-left text-xs text-slate-700 transition hover:border-slate-200 hover:bg-white focus:outline-none"
      onClick={() => {
        setIsEditing(true);
        setStatus("idle");
        setErrorMessage(null);
      }}
    >
      {value?.trim() ? (
        <span className="block w-full truncate" title={value}>
          {truncateInline(value)}
        </span>
      ) : (
        <span className="block w-full truncate italic text-slate-400">
          Add description
        </span>
      )}
    </button>
  );

  const editView = (
    <form onSubmit={onSubmit} className="flex w-full flex-col">
      <input
        {...register("description")}
        className="min-h-[1.75rem] w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
        placeholder="Add notes"
        maxLength={300}
        disabled={status === "saving"}
        autoFocus
        style={{ overflowX: "auto", whiteSpace: "nowrap" }}
        onBlur={() => {
          if (status === "saving") {
            return;
          }
          reset({ description: value ?? "" }, { keepDirty: false });
          setIsEditing(false);
          setStatus("idle");
          setErrorMessage(null);
        }}
      />
    </form>
  );

  return (
    <div className="flex w-full flex-col">
      {isEditing ? editView : readOnlyView}
      <div className="h-0 text-[0.6rem]">
        {isEditing &&
          (errorMessage ? (
            <p className="text-red-600">{errorMessage}</p>
          ) : status === "success" ? (
            <p className="text-emerald-600">Saved</p>
          ) : null)}
      </div>
    </div>
  );
}
