# Changelog

## 2.1.7 - 2025-09-30
- Införde PropertyResolver-instruktioner och metadataexempel för `/v1/databases/{database_id}`.
- Krävde request-body och pagineringsparametrar för `/v1/databases/{database_id}/query` och `/v1/search` samt lade till nya filterexempel.
- Stramade åt append-endpointen med blockspecifika scheman och stopp för ogiltiga fält.
- Säkrade header-krav för samtliga POST/PATCH-anrop och dokumenterade pagineringens användning.
- Lade till dynamiska property-exempel för skapande och uppdatering av sidor samt formelfilter.
