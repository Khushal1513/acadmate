import logging
from typing import List, Dict, Any, Optional
import os
import pinecone  # new SDK

from config import config

logger = logging.getLogger(__name__)


class RetrievalService:
    """
    Service for retrieving similar documents from Pinecone.
    """

    def __init__(self, index_name: str = None):
        self.index_name = index_name or config.PINECONE_INDEX_NAME

        # Initialize Pinecone
        self._initialize_pinecone()

    def _initialize_pinecone(self):
        """Initialize Pinecone client and index."""
        logger.info("Initializing Pinecone client")

        # Use environment variables for safety
        api_key = os.environ.get("PINECONE_API_KEY")
        environment = os.environ.get("PINECONE_ENV")

        if not api_key or not environment:
            raise ValueError(
                "PINECONE_API_KEY and PINECONE_ENV must be set as environment variables"
            )

        pinecone.init(api_key=api_key, environment=environment)

        # Connect to the index
        self.index = pinecone.Index(self.index_name)

        logger.info(f"Connected to Pinecone index: {self.index_name}")

    def query(
        self,
        query_vector: List[float],
        top_k: int = None,
        namespace: Optional[str] = None,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Query Pinecone for similar vectors.

        Args:
            query_vector: Embedding vector
            top_k: Number of results to return
            namespace: Pinecone namespace to search
            filter_metadata: Metadata filters for pre-filtering

        Returns:
            List of matched documents with scores and metadata
        """
        top_k = top_k or config.DEFAULT_TOP_K

        if top_k > config.MAX_TOP_K:
            logger.warning(f"top_k={top_k} exceeds MAX_TOP_K={config.MAX_TOP_K}, capping")
            top_k = config.MAX_TOP_K

        query_params = {
            "vector": query_vector,
            "top_k": top_k,
            "include_metadata": True
        }

        if namespace:
            query_params["namespace"] = namespace

        if filter_metadata:
            query_params["filter"] = filter_metadata

        logger.info(f"Querying Pinecone: top_k={top_k}, namespace={namespace}")
        response = self.index.query(**query_params)

        # Format results
        matches = [
            {
                "id": match["id"],
                "score": match["score"],
                "metadata": match.get("metadata", {})
            }
            for match in response.get("matches", [])
        ]

        logger.info(f"Retrieved {len(matches)} documents")
        return matches

    def get_index_stats(self) -> dict:
        """Get Pinecone index statistics."""
        stats = self.index.describe_index_stats()
        return {
            "dimension": stats.get("dimension"),
            "total_vector_count": stats.get("total_vector_count"),
            "namespaces": stats.get("namespaces", {})
        }
