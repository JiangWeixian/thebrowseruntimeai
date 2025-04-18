# thebrowserruntimeai

## Models and Browser Compatibility

| Task | Model | Firefox | Chrome |
|------|-------|---------|--------|
| Text Classification | Xenova/distilbert-base-uncased-finetuned-sst-2-english | ❌ | ❌ |
| Token Classification | Xenova/bert-base-multilingual-cased-ner-hrl | ❌ | ❌ |
| Question Answering | Xenova/distilbert-base-cased-distilled-squad | ❌ | ❌ |
| Fill Mask | Xenova/bert-base-uncased | ❌ | ❌ |
| Summarization | Xenova/distilbart-cnn-6-6 | ✅ | ❌ |
| Translation | Xenova/t5-small | ✅ | ❌ |
| Text2Text Generation | Xenova/flan-t5-small | ❌ | ❌ |
| Text Generation | Xenova/gpt2 | ❌ | ❌ |
| Zero-shot Classification | Xenova/distilbert-base-uncased-mnli | ❌ | ❌ |
| Image to Text | Mozilla/distilvit | ✅ | ❌ |
| Image Classification | Xenova/vit-base-patch16-224 | ❌ | ❌ |
| Image Segmentation | Xenova/detr-resnet-50-panoptic | ❌ | ❌ |
| Zero-shot Image Classification | Xenova/clip-vit-base-patch32 | ❌ | ❌ |
| Object Detection | Xenova/detr-resnet-50 | ❌ | ❌ |
| Zero-shot Object Detection | Xenova/owlvit-base-patch32 | ❌ | ❌ |
| Document Question Answering | Xenova/donut-base-finetuned-docvqa | ❌ | ❌ |
| Image to Image | Xenova/swin2SR-classical-sr-x2-64 | ❌ | ❌ |
| Depth Estimation | Xenova/dpt-large | ❌ | ❌ |
| Feature Extraction | Xenova/all-MiniLM-L6-v2 | ❌ | ❌ |
| Image Feature Extraction | Xenova/vit-base-patch16-224-in21k | ❌ | ❌ |

## refs

- [huggingface pipelines](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TranslationPipeline)
- [firefox ml apis](https://firefox-source-docs.mozilla.org/toolkit/components/ml/extensions.html#webextensions-ai-api)
