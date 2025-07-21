from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
import json
import sys

input_text = sys.stdin.read()
articles = json.loads(input_text)
articles = [str(article) if article is not None else "" for article in articles]

model = SentenceTransformer("hkunlp/instructor-large")

instruction = "Represent the political or social perspective of the news article"

input_pairs = [[instruction, article] for article in articles]

embeddings = model.encode(input_pairs, batch_size=4, show_progress_bar=True)

n_clusters = min(3, len(articles))  # jml perspektif
kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
labels = kmeans.fit_predict(embeddings)

clusters = {i: [] for i in range(n_clusters)}
for idx, label in enumerate(labels):
    clusters[label].append(articles[idx])

# for i in range(n_clusters):
#     print(f"\n=== Perspektif {i+1} ===\n")
#     for text in clusters[i][:3]:  
#         print(f"- {text[:200]}...\n")  

output = {
    f"perspective_{i+1}": clusters[i]
    for i in range(n_clusters)
}

print(json.dumps(output, ensure_ascii=False))
sys.stdout.flush()