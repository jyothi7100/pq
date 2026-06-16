namespace admin.config;

entity EmailRecipients {
  key ID       : UUID ;
  email        : String(255);
  createdAt    : Timestamp @default : current_timestamp;
}

entity CommodityCategoryMappings {
  key ID                 : UUID;
  commodityCode          : String(40);
  commodityDesc          : String(255);     // ⭐ NEW
  productCategory        : String(255);     // ⭐ used for PQ mapping
  createdAt              : Timestamp @default : current_timestamp;
}


entity Suppliers {
  key smVendorId     : String(40);
  supplierName       : String(255);
  registrationStatus : String(40);
  updatedDate        : String(80);
  rawJson            : LargeString;
}

entity PQLogs {
  key ID         : UUID ;
  smVendorId     : String(40);
  action         : String(255);
  status         : String(40);
  details        : LargeString;
  createdAt      : Timestamp @default : current_timestamp ;
}

entity PQConfig {
  key ID : UUID @default : uuid;

  templateId              : String(80);
  templateProcessId       : String(80);

  expiryOffset            : Integer;
  expiryFrequency         : String(40);

  expiryReminderOffset    : Integer;
  expiryReminderFrequency : String(40);

  internalId              : String(80);

  categoryItemId          : String(80);
  categoryCorrelationId   : String(80);

  commodityItemId         : String(80);
  commodityCorrelationId  : String(80);

  regionItemId            : String(80);
  regionCorrelationId     : String(80);

  endDateItemId           : String(80);
  endDateCorrelationId    : String(80);

  createdAt               : Timestamp @default : current_timestamp;
}
