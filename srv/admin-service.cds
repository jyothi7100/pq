using admin.config as cfg from '../db/schema';

service AdminService {

  entity EmailRecipients             as projection on cfg.EmailRecipients;
  entity CommodityCategoryMappings   as projection on cfg.CommodityCategoryMappings;
  entity Suppliers                   as projection on cfg.Suppliers;
  entity PQLogs                      as projection on cfg.PQLogs;
  entity PQConfig                  as projection on cfg.PQConfig;

  action UploadCommodityMappings(
    csvContent : LargeString
  ) returns Integer;

  action FetchRegisteredSuppliers(
    updatedDateFrom : String,
    updatedDateTo   : String
  ) returns String;

  action FetchSupplierProcesses(
    smVendorId : String
  ) returns String;

  action EvaluatePQ(
    smVendorId : String
  ) returns String;

  action TriggerPQ(
    smVendorId : String,
    categoryId : String,
    regionId   : String
  ) returns String;

  action TriggerSinglePQ(
  ) returns String;

  action RunPQJobScheduled() returns String;
}
