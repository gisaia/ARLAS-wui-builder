import { CollectionService } from '@services/collection-service/collection.service';
import { NUMERIC_OR_DATE_OR_TEXT_TYPES, toOptionsObs } from '@services/collection-service/tools';
import { ResultlistDetailFieldFormGroup } from './form-group';

export function buildDetailField(collectionService: CollectionService, collection: string) {
  return new ResultlistDetailFieldFormGroup(
    toOptionsObs(
      collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_TEXT_TYPES))
  );
}
