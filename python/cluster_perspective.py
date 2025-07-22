from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
import json
import sys

def clean_and_validate_articles(articles):
    """Clean and validate article data to ensure all entries are strings"""
    cleaned_articles = []
    
    for article in articles:
        if article is None:
            continue
        
        if isinstance(article, dict):
            text = article.get('content', '') or article.get('text', '') or str(article)
        elif isinstance(article, list):
            text = ' '.join(str(item) for item in article if item)
        else:
            text = str(article)
        
        text = text.strip()
        
        if len(text) > 10:
            cleaned_articles.append(text)
    
    return cleaned_articles

try:
    input_text = sys.stdin.read()
    if not input_text.strip():
        print(json.dumps({"error": "No input data provided"}))
        sys.exit(1)
    
    raw_articles = json.loads(input_text)
    
    articles = clean_and_validate_articles(raw_articles)
    
    if len(articles) == 0:
        print(json.dumps({"error": "No valid articles found after cleaning"}))
        sys.exit(1)
    
    model = SentenceTransformer("hkunlp/instructor-large")
    
    instruction = "Represent the different perspectives of the news article"
    
    input_pairs = []
    for article in articles:
        if isinstance(article, str) and len(article.strip()) > 0:
            input_pairs.append([instruction, article])
    
    if len(input_pairs) == 0:
        print(json.dumps({"error": "No valid input pairs created"}))
        sys.exit(1)
    
    embeddings = model.encode(input_pairs, batch_size=4, show_progress_bar=True)
    
    n_clusters = min(3, len(articles))
    if n_clusters == 1:
        output = {
            "perspective_1": articles
        }
    else:
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
        labels = kmeans.fit_predict(embeddings)
        
        clusters = {i: [] for i in range(n_clusters)}
        for idx, label in enumerate(labels):
            clusters[label].append(articles[idx])
        
        output = {
            f"perspective_{i+1}": clusters[i]
            for i in range(n_clusters)
        }
    
    print(json.dumps(output, ensure_ascii=False))
    sys.stdout.flush()

except json.JSONDecodeError as e:
    print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"error": f"Processing error: {str(e)}"}))
    sys.exit(1)