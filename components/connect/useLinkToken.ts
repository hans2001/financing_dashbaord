"use client";

import { useEffect, useState } from "react";

type LinkTokenResponse = {
  link_token: string;
  error?: string;
};

export function useLinkToken() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isFetchingToken, setIsFetchingToken] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadLinkToken = async () => {
      setIsFetchingToken(true);
      setFetchError(null);
      setIsUnauthorized(false);

      try {
        const response = await fetch("/api/plaid/create-link-token", {
          method: "POST",
        });
        const data: LinkTokenResponse = await response.json();
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setIsUnauthorized(true);
            throw new Error(data?.error ?? "Please sign in to continue");
          }
          throw new Error(data?.error ?? "Unable to create link token");
        }
        if (!ignore) {
          setLinkToken(data.link_token);
        }
      } catch (error) {
        if (!ignore) {
          setFetchError(
            error instanceof Error ? error.message : "Failed to create link token",
          );
        }
      } finally {
        if (!ignore) {
          setIsFetchingToken(false);
        }
      }
    };

    loadLinkToken();

    return () => {
      ignore = true;
    };
  }, []);

  return { linkToken, isFetchingToken, fetchError, isUnauthorized };
}
