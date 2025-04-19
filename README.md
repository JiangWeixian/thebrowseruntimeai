# thebrowserruntimeai

One-click experience of browser's built-in AI features

> [!WARNING]  
Firefox trail ml require extension running in singleton mode, Run different task on same page should reload extension first!(reload page is not working)

https://github.com/user-attachments/assets/1ca850a6-260d-4dd0-a1e0-a91339d41367

## Usage

### Firefox

1. Install firefox nightly version
2. Download extension from [release page](https://github.com/JiangWeixian/thebrowseruntimeai/releases)
3. Open `about:debugging#/runtime/this-firefox` and load the extension (check [link](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) for more details)

## Models and Browser Compatibility

| Task | Model | Firefox Nightly | Chrome |
|------|-------|---------|--------|
| Text Classification | Xenova/distilbert-base-uncased-finetuned-sst-2-english | ✅ | ❌ |
| Token Classification | Xenova/bert-base-multilingual-cased-ner-hrl | ❌ | ❌ |
| Question Answering | Xenova/distilbert-base-cased-distilled-squad | ❌ | ❌ |
| Fill Mask | Xenova/bert-base-uncased | ❌ | ❌ |
| Summarization | Xenova/distilbart-cnn-6-6 | ✅ | ❌ |
| Translation | Xenova/t5-small | ✅ | ❌ |
| Text2Text Generation | Xenova/flan-t5-small | ❌ | ❌ |
| Text Generation | Xenova/distilgpt2 | ✅ | ❌ |
| Zero-shot Classification | Xenova/distilbert-base-uncased-mnli | ❌ | ❌ |
| Image to Text | Mozilla/distilvit | ✅ | ❌ |
| Image Classification | Xenova/vit-base-patch16-224 | ✅ | ❌ |
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

## development

### for firefox nightly

```bash
pnpm install
IS_FIREFOX_WEBEXT=1 pnpm run build
pnpm run start:firefox-nightly
```
