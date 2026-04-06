"""ChromaDB Cloud vector store for document storage and retrieval."""

import chromadb
from app.core.config import CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE, TOP_K_RESULTS
from app.rag.embedder import generate_single_embedding

_client = None
_collection = None

COLLECTION_NAME = "zuri_knowledge"


def _get_collection() -> chromadb.Collection:
    global _client, _collection
    if _collection is None:
        _client = chromadb.CloudClient(
            api_key=CHROMA_API_KEY,
            tenant=CHROMA_TENANT,
            database=CHROMA_DATABASE,
        )
        _collection = _client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def add_document(
    document_id: int,
    hotel_id: str,
    chunks: list[str],
    embeddings: list[list[float]],
    filename: str,
):
    """Store document chunks with their embeddings in ChromaDB Cloud."""
    collection = _get_collection()

    ids = [f"doc{document_id}_chunk{i}" for i in range(len(chunks))]
    metadatas = [
        {"document_id": document_id, "hotel_id": hotel_id, "filename": filename, "chunk_index": i}
        for i in range(len(chunks))
    ]

    # ChromaDB Cloud has batch limits, process in chunks of 500
    batch_size = 500
    for i in range(0, len(ids), batch_size):
        end = i + batch_size
        collection.add(
            ids=ids[i:end],
            documents=chunks[i:end],
            embeddings=embeddings[i:end],
            metadatas=metadatas[i:end],
        )


def query(question: str, hotel_id: str, top_k: int = TOP_K_RESULTS) -> dict:
    """
    Query the vector store with a question, filtered by hotel_id.
    Returns dict with 'documents', 'metadatas', and 'distances'.
    """
    collection = _get_collection()

    if collection.count() == 0:
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    query_embedding = generate_single_embedding(question)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        where={"hotel_id": hotel_id},
        include=["documents", "metadatas", "distances"],
    )

    return results


def delete_document(document_id: int):
    """Remove all chunks for a specific document from the vector store."""
    collection = _get_collection()

    results = collection.get(
        where={"document_id": document_id},
        include=[],
    )

    if results["ids"]:
        collection.delete(ids=results["ids"])


def get_document_content(document_id: int) -> str:
    """
    Reconstruct document text from its chunks in ChromaDB.
    Returns the stitched content string.
    """
    collection = _get_collection()
    
    # Retrieve all chunks for this document
    results = collection.get(
        where={"document_id": document_id},
        include=["documents", "metadatas"]
    )
    
    if not results["ids"]:
        return ""
        
    # Sort by chunk_index to maintain original order
    # Zip IDs, docs, and metadatas together for sorting
    chunks = []
    for doc, meta in zip(results["documents"], results["metadatas"]):
        chunks.append({
            "content": doc,
            "index": meta.get("chunk_index", 0)
        })
        
    # Standard sort by index
    chunks.sort(key=lambda x: x["index"])
    
    # Stitch everything together
    full_text = "\n\n".join([c["content"] for c in chunks])
    return full_text
