import { useEffect, useState } from "react";
import { getRepository } from "../admin/data/repository.js";
import { DEMO_SCHOOL_ID } from "../data/schools.js";

//--------------------------------------------------------------
//--------------------------------------------------------------
export function usePublishedContent() {
  const [published, setPublished] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getRepository()
      .then((repo) => repo.listPublishedContent({ schoolId: DEMO_SCHOOL_ID }))
      .then((items) => {
        if (alive) setPublished(items);
      })
      .catch((err) => {
        if (alive)
          setError(err.message || "A közzétett tartalmak nem tölthetők be.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { published, error, loading };
}
