const cds = require("@sap/cds");
const axios = require("axios");
const nodemailer = require("nodemailer");

// ============================================================
// EMAIL SENDER (GMAIL SMTP)
// ============================================================
async function sendErrorEmail(subject, body) {
  try {
    const db = await cds.connect.to("db");
    const EmailRecipients = db.entities.EmailRecipients;

    // Fetch all admin-configured emails
    const recipients = await SELECT.from(EmailRecipients);
    const toList = recipients.map(r => r.email).filter(Boolean);

    if (toList.length === 0) {
      console.warn("⚠ No vendor management emails configured.");
      return;
    }

    // Gmail SMTP Transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "jayachitula@gmail.com",
        pass: "ejzk goei vsdm qgwi"
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: "jayachitula@gmail.com",
      to: toList.join(","),
      subject,
      html: body
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Error email sent to:", toList.join(", "));

  } catch (err) {
    console.error("❌ Failed to send error email:", err);
  }
}
 
// ============================================================
// EMAIL BODY TEMPLATE
// ============================================================
function buildErrorEmail(combined, stepName, errorMessage, reasonDescription) {
  return `
Hello Vendor Management Team,

An issue occurred during the automated PQ processing workflow.

Summary:
• Supplier ID: ${combined?.smVendorId || "N/A"}
• Supplier Name: ${combined?.supplierName || "N/A"}
• Step Failed: ${stepName}
• Timestamp: ${new Date().toISOString()}

Details:
${errorMessage}

Additional Context:
• Commodity Codes from Ariba: ${combined?.categories}
• Mapped Categories (CSV): ${combined?.mappedCategories}
• Regions: ${combined?.regions}

Reason:
${reasonDescription}

Recommended Action:
Please review the supplier’s mapping configuration and correct the missing or invalid data.
If the issue persists, contact the technical support team.

Regards,
Vendor Management Automation
`;
}


// ============================================================
// EMAIL BODY TEMPLATE (HTML)
// ============================================================

function buildHtmlErrorEmail(combined, stepName, errorMessage, reasonDescription) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>PQ Processing Workflow Failure</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f9;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f6f9">
  <tr>
    <td align="center" style="padding:20px;">

      <!-- Main Container -->
      <table width="800" cellpadding="0" cellspacing="0" border="0"
             style="width:800px;background-color:#ffffff;border:1px solid #d9d9d9;">

         <!-- Header -->
  <tr>
    <td bgcolor="#0a6ed1" style="padding:20px;">

      <img
        src="https://s1.mn1.ariba.com/Sourcing/Main/ad/awres/746138565-T/ICMBranding/214/cmdbar_prod_light.png"
        alt="SAP Ariba"
        height="30"
        style="display:block;border:0;margin-bottom:15px;">

      <div style="
        font-family:Arial,Helvetica,sans-serif;
        font-size:28px;
        font-weight:bold;
        color:#ffffff;">
        PQ Processing Workflow Failure
      </div>

    </td>
  </tr>

        <!-- Content -->
        <tr>
          <td style="padding:25px;font-family:Arial,Helvetica,sans-serif;
                     font-size:15px;color:#333333;line-height:1.6;">

            <p style="margin-top:0;">
              Hello Vendor Management Team,
            </p>

            <p>
              An issue occurred during the automated PQ processing workflow.
              Please review the details below.
            </p>

            <!-- Summary -->
            <h2 style="color:#0a6ed1;font-size:24px;margin-top:30px;">
              Summary
            </h2>

            <table width="100%" cellpadding="0" cellspacing="0" border="1"
                   style="border-collapse:collapse;border:1px solid #d9d9d9;">

              <tr>
                <td width="35%"
                    style="padding:12px;font-weight:bold;background:#f7f7f7;">
                  Supplier ID
                </td>
                <td style="padding:12px;">
                  ${combined?.smVendorId || "N/A"}
                </td>
              </tr>

              <tr>
                <td style="padding:12px;font-weight:bold;background:#f7f7f7;">
                  Supplier Name
                </td>
                <td style="padding:12px;">
                  ${combined?.supplierName || "N/A"}
                </td>
              </tr>

              <tr>
                <td style="padding:12px;font-weight:bold;background:#f7f7f7;">
                  Step Failed
                </td>
                <td style="padding:12px;">
                  ${stepName}
                </td>
              </tr>

              <tr>
                <td style="padding:12px;font-weight:bold;background:#f7f7f7;">
                  Timestamp
                </td>
                <td style="padding:12px;">
                  ${new Date().toISOString()}
                </td>
              </tr>

            </table>

            <!-- Error Details -->
            <h2 style="color:#0a6ed1;font-size:24px;margin-top:30px;">
              Error Details
            </h2>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="
                    border-left:5px solid #d32f2f;
                    background-color:#fdecea;
                    padding:15px;
                    color:#333333;">
                  ${errorMessage}
                </td>
              </tr>
            </table>

            <!-- Additional Context -->
            <h2 style="color:#0a6ed1;font-size:24px;margin-top:30px;">
              Additional Context
            </h2>

            <table width="100%" cellpadding="0" cellspacing="0" border="1"
                   style="border-collapse:collapse;border:1px solid #d9d9d9;">

              <tr>
                <td width="35%"
                    style="padding:12px;font-weight:bold;background:#f7f7f7;">
                  Commodity Codes from Ariba
                </td>
                <td style="padding:12px;">
                  ${combined?.categories || "N/A"}
                </td>
              </tr>

              <tr>
                <td style="padding:12px;font-weight:bold;background:#f7f7f7;">
                  Mapped Categories (CSV)
                </td>
                <td style="padding:12px;">
                  ${combined?.mappedCategories || "N/A"}
                </td>
              </tr>

              <tr>
                <td style="padding:12px;font-weight:bold;background:#f7f7f7;">
                  Regions
                </td>
                <td style="padding:12px;">
                  ${combined?.regions || "N/A"}
                </td>
              </tr>

            </table>

            <!-- Reason -->
            <h2 style="color:#0a6ed1;font-size:24px;margin-top:30px;">
              Reason
            </h2>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="
                    border-left:5px solid #ff9800;
                    background-color:#fff8e1;
                    padding:15px;
                    color:#333333;">
                  ${reasonDescription}
                </td>
              </tr>
            </table>

            <!-- Action -->
            <h2 style="color:#0a6ed1;font-size:24px;margin-top:30px;">
              Recommended Action
            </h2>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="
                    border-left:5px solid #2e7d32;
                    background-color:#e8f5e9;
                    padding:15px;">
                  <ul style="margin:0;padding-left:20px;">
                    <li>Review the supplier mapping configuration.</li>
                    <li>Correct any missing or invalid data.</li>
                    <li>Validate category and region mappings.</li>
                    <li>Re-run the PQ workflow after corrections.</li>
                    <li>If the issue persists, contact the technical support team.</li>
                  </ul>
                </td>
              </tr>
            </table>

            <br>

            <p>
              Regards,<br>
              <strong>Vendor Management Automation</strong>
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td bgcolor="#f7f7f7"
              style="padding:15px;text-align:center;
                     font-family:Arial,Helvetica,sans-serif;
                     font-size:12px;color:#666666;">
            This is an automated notification generated by the Vendor Management Automation platform.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;
}



module.exports = cds.service.impl(async function () {

  // ============================================================
  // STEP 1 — OAUTH TOKEN
  // ============================================================
  // async function getOAuthToken() {
  //   try {
  //     console.log("\n================ STEP 1: OAUTH TOKEN =====================");

  //     const url = "https://api.mn1.ariba.com/v2/oauth/token";

  //     const headers = {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //       "Authorization": "Basic N2I1Zjg5ZWMtN2IyMC00ZGQ2LTk5OTMtYTdkMGFlMDExNjlhOnBDcUFBdmNjczE2NFhrRXFwRWZvajlabks1VlhzbzRv"
  //     };

  //     const body = new URLSearchParams({ grant_type: "openapi_2lo" });

  //     const response = await axios.post(url, body, { headers });

  //     console.log("OAuth Response:");
  //     console.log(JSON.stringify(response.data, null, 2));
  //     console.log("==========================================================\n");

  //     return response.data.access_token;

  //   } catch (err) {
  //     console.error("STEP 1 — OAUTH TOKEN FAILED");
  //     console.error(err.response?.data || err);
  //     throw new Error("OAuth Token Failed");
  //   }
  // }

  const oauthServiceName = process.env.NODE_ENV === "production" ? "ARIBA_OAUTH_PROD" : "ARIBA_OAUTH";

async function getOAuthToken() {
  try {
    console.log("\n================ STEP 1: OAUTH TOKEN =====================");
    const oauth = await cds.connect.to(oauthServiceName);

    const response = await oauth.send({
      method: "POST",
      path: "/v2/oauth/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: "grant_type=openapi_2lo"
    });

    return response.access_token;

  } catch (err) {
    console.error("STEP 1 — OAUTH TOKEN FAILED");
    console.error(err);
    throw new Error("OAuth Token Failed");
  }
}
  function toAribaTimestamp(date) {
  return new Date(date).toISOString().replace(/\.\d{3}Z$/, "Z");
}


  // // ============================================================
  // // STEP 2 — FETCH REGISTERED SUPPLIERS
  // // ============================================================
  // async function fetchRegisteredSuppliers(token, updatedDateFrom, updatedDateTo) {
  //   try {
  //     console.log("\n================ STEP 2: FETCH REGISTERED SUPPLIERS =====================");

  //     // ⭐ FIX: Auto-generate timestamps if missing
  //   if (!updatedDateFrom || !updatedDateTo) {
  //     const now = new Date();
  //     const oneMonthAgo = new Date();
  //     oneMonthAgo.setMonth(now.getMonth() - 1);

  //     updatedDateFrom = toAribaTimestamp(oneMonthAgo);
  //     updatedDateTo   = toAribaTimestamp(now);
  //   }

  //     const url = `https://mn1.openapi.ariba.com/api/supplierdatapagination/v4/prod/vendorDataRequests?realm=746138565-T&$filter=updatedDateFrom ge '${updatedDateFrom}' and updatedDateTo le '${updatedDateTo}'`;

  //     const headers = {
  //       "apiKey": "PvYjyxNHJjwBUN3xTwezHbh9MutVFNgg",
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${token}`
  //     };

  //     const body = {
  //       outputFormat: "JSON",
  //       withQuestionnaire: true,
  //       registrationStatusList: ["Registered"]
  //     };

  //     const response = await axios.post(url, body, { headers });

  //     console.log("Supplier Pagination API Response:");
  //     console.log(JSON.stringify(response.data, null, 2));
  //     console.log("=======================================================================\n");

  //     return response.data;

  //   } catch (err) {
  //     console.error("STEP 2 — FETCH REGISTERED SUPPLIERS FAILED");
  //     console.error(err.response?.data || err);
  //     throw new Error("Supplier Fetch Failed");
  //   }
  // }

  // ============================================================
// STEP 2 — FETCH REGISTERED SUPPLIERS
// ============================================================
async function fetchRegisteredSuppliers(token, updatedDateFrom, updatedDateTo) {
  try {
    console.log("\n================ STEP 2: FETCH REGISTERED SUPPLIERS =====================");

    // ⭐ Auto-generate timestamps if missing
    if (!updatedDateFrom || !updatedDateTo) {
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      updatedDateFrom = toAribaTimestamp(oneMonthAgo);
      updatedDateTo   = toAribaTimestamp(now);
    }

    const supplierServiceName = process.env.NODE_ENV === "production" ? "ARIBA_SUPPLIER_PAGINATION_PROD" : "ARIBA_SUPPLIER_PAGINATION";
    const supplierService = await cds.connect.to(supplierServiceName);

    const response = await supplierService.send({
      method : "POST",
      path   : `/vendorDataRequests?realm=746138565-T&$filter=updatedDateFrom ge '${updatedDateFrom}' and updatedDateTo le '${updatedDateTo}'`,
      headers: {
        "apiKey"       : "PvYjyxNHJjwBUN3xTwezHbh9MutVFNgg",
        "Content-Type" : "application/json",
        "Authorization": `Bearer ${token}`
      },
      data: {
        outputFormat          : "JSON",
        withQuestionnaire     : true,
        registrationStatusList: ["Registered"]
      }
    });

    console.log("Supplier Pagination API Response:");
    console.log(JSON.stringify(response, null, 2));
    console.log("=======================================================================\n");

    return response;

  } catch (err) {
    console.error("STEP 2 — FETCH REGISTERED SUPPLIERS FAILED");
    console.error(err);
    throw new Error("Supplier Fetch Failed");
  }
}

  // // ============================================================
  // // STEP 3 — FETCH PROCESSES FOR EACH SUPPLIER
  // // ============================================================
  // async function fetchSupplierProcesses(token, smVendorId) {
  //   try {
  //     console.log(`\n===== STEP 3: FETCH PROCESSES FOR SUPPLIER ${smVendorId} =====`);

  //     const url = `https://mn1.openapi.ariba.com/api/supplierdatapagination/v4/prod/vendors/${smVendorId}/processes?realm=746138565-T`;

  //     const headers = {
  //       "apiKey": "PvYjyxNHJjwBUN3xTwezHbh9MutVFNgg",
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${token}`
  //     };

  //     const response = await axios.get(url, { headers });

  //     console.log(`Processes for ${smVendorId}:`);
  //     console.log(JSON.stringify(response.data, null, 2));

  //     return response.data;

  //   } catch (err) {
  //     console.error(`FAILED fetching processes for ${smVendorId}`);
  //     console.error(err.response?.data || err);
  //     return null;
  //   }
  // }

  // ============================================================
// STEP 3 — FETCH PROCESSES FOR EACH SUPPLIER
// ============================================================
async function fetchSupplierProcesses(token, smVendorId) {
  try {
    console.log(`\n===== STEP 3: FETCH PROCESSES FOR SUPPLIER ${smVendorId} =====`);

    const processesServiceName = process.env.NODE_ENV === "production" ? "ARIBA_PROCESSES_PROD" : "ARIBA_PROCESSES";
    const processesService = await cds.connect.to(processesServiceName);

    const response = await processesService.send({
      method : "GET",
      path   : `/${smVendorId}/processes?realm=746138565-T`,
      headers: {
        "apiKey"       : "PvYjyxNHJjwBUN3xTwezHbh9MutVFNgg",
        "Content-Type" : "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    console.log(`Processes for ${smVendorId}:`);
    console.log(JSON.stringify(response, null, 2));

    return response;

  } catch (err) {
    console.error(`FAILED fetching processes for ${smVendorId}`);
    console.error(err);
    return null;
  }
}

  // // ============================================================
  // // STEP 4A — FETCH VENDOR WORKSPACES
  // // ============================================================
  // async function fetchVendorWorkspaces(token, smVendorId) {
  //   try {
  //     console.log(`\n===== STEP 4A: FETCH WORKSPACES FOR SUPPLIER ${smVendorId} =====`);

  //     const url = `https://mn1.openapi.ariba.com/api/supplierdatapagination/v4/prod/vendors/${smVendorId}/workspaces?realm=746138565-T&$top=1`;

  //     const headers = {
  //       "apiKey": "PvYjyxNHJjwBUN3xTwezHbh9MutVFNgg",
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${token}`
  //     };

  //     const response = await axios.get(url, { headers });

  //     console.log(`Workspaces for ${smVendorId}:`);
  //     console.log(JSON.stringify(response.data, null, 2));

  //     return response.data;

  //   } catch (err) {
  //     console.error(`FAILED fetching workspaces for ${smVendorId}`);
  //     console.error(err.response?.data || err);
  //     return null;
  //   }
  // }

  // ============================================================
// STEP 4A — FETCH VENDOR WORKSPACES
// ============================================================
async function fetchVendorWorkspaces(token, smVendorId) {
  try {
    console.log(`\n===== STEP 4A: FETCH WORKSPACES FOR SUPPLIER ${smVendorId} =====`);

    const processesServiceName = process.env.NODE_ENV === "production" ? "ARIBA_PROCESSES_PROD" : "ARIBA_PROCESSES";
    const processesService = await cds.connect.to(processesServiceName);

    const response = await processesService.send({
      method : "GET",
      path   : `/${smVendorId}/workspaces?realm=746138565-T&$top=1`,
      headers: {
        "apiKey"       : "PvYjyxNHJjwBUN3xTwezHbh9MutVFNgg",
        "Content-Type" : "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    console.log(`Workspaces for ${smVendorId}:`);
    console.log(JSON.stringify(response, null, 2));

    return response;

  } catch (err) {
    console.error(`FAILED fetching workspaces for ${smVendorId}`);
    console.error(err);
    return null;
  }
}

  // ============================================================
  // STEP 5 — BUILD COMBINED PAYLOAD (ARIBA + HANA PQCONFIG + MAPPING TABLE)
  // ============================================================
  async function buildCombinedPayload(token, supplier) {

    const smVendorId = supplier["SM Vendor ID"];

    // STEP 5A — Extract fields from Step 2
    const oRegistrationQ = (supplier.questionnaires || []).find(
      (q) => q.workspaceType === "REGISTRATION" && q.matrixInfo
    );

    const aCategories = oRegistrationQ?.matrixInfo?.Category || []; // commodity codes
    const aRegions    = oRegistrationQ?.matrixInfo?.Region   || [];

   // STEP 5B — Extract requester/requesterId from correct Ariba path
const oWorkspaceData = await fetchVendorWorkspaces(token, smVendorId);

// Ariba returns requester info inside "SupplierRequest"
const supplierReqArray = oWorkspaceData?.workspaces?.SupplierRequest || [];
const oLatestRequest = supplierReqArray[0] || {};

let initiatorName = "";

// 1️⃣ Prefer requesterId (login ID)
if (oLatestRequest.requesterId) {
  initiatorName = oLatestRequest.requesterId;
}
// 2️⃣ If requesterId missing → use requester (full name)
else if (oLatestRequest.requester) {
  initiatorName = oLatestRequest.requester;
}
// 3️⃣ If both missing → leave empty string (Ariba will error naturally)

console.log("INITIATOR NAME BEING SENT:", initiatorName);


    // STEP 5C — Fetch PQConfig from HANA DB
    const db       = await cds.connect.to("db");
    const PQConfig = db.entities.PQConfig;
    const config   = await SELECT.one.from(PQConfig);

    if (!config) {
      console.error("❌ No PQConfig found in DB");
    }

    // STEP 5D — Fetch mapping table
    const CommodityCategoryMappings = db.entities.CommodityCategoryMappings;
    const mappingRows = await SELECT.from(CommodityCategoryMappings);

    // Build dictionary: commodityCode → productCategory
    const mappingDict = {};
    for (const row of mappingRows) {
      mappingDict[row.commodityCode] = {
        category    : row.productCategory,
        description : row.commodityDesc
      };
    }

    // STEP 5E — Map Ariba commodity codes → product categories
    const mappedCategories = (aCategories || [])
      .map(code => mappingDict[code]?.category)
      .filter(Boolean);

    const mappedDescriptions = (aCategories || [])
      .map(code => mappingDict[code]?.description)
      .filter(Boolean);

    // ⭐ EMAIL TRIGGER — MAPPING FAILURE
if (mappedCategories.length === 0) {
  const stepName = "Mapping Lookup";
  const reasonDescription = "No mapping found for one or more commodity codes.";

  const emailBody = buildHtmlErrorEmail(
    { smVendorId, categories: aCategories, mappedCategories, regions: aRegions },
    stepName,
    "Mapping table returned no results",
    reasonDescription
  );

  await sendErrorEmail("PQ Mapping Failure", emailBody);

  // ❗ STOP PQ PROCESSING FOR THIS SUPPLIER
  throw new Error(`Mapping missing for supplier ${smVendorId} — PQ will NOT be triggered.`);
}


    // STEP 5F — Combine all fields
    const oCombined = {
      smVendorId,
      categories        : aCategories,       // commodity codes from Ariba
      regions           : aRegions,
      mappedCategories,                      // productCategory from mapping table
      mappedDescriptions,                    // optional, for logs
      initiatorName,                         // requesterId AS-IS

      templateId              : config?.templateId,
      templateProcessId       : config?.templateProcessId,

      expiryOffset            : config?.expiryOffset,
      expiryFrequency         : config?.expiryFrequency,
      expiryReminderOffset    : config?.expiryReminderOffset,
      expiryReminderFrequency : config?.expiryReminderFrequency,

      internalId              : config?.internalId,

      categoryItemId          : config?.categoryItemId,
      categoryCorrelationId   : config?.categoryCorrelationId,

      commodityItemId         : config?.commodityItemId,
      commodityCorrelationId  : config?.commodityCorrelationId,

      regionItemId            : config?.regionItemId,
      regionCorrelationId     : config?.regionCorrelationId,

      endDateItemId           : config?.endDateItemId,
      endDateCorrelationId    : config?.endDateCorrelationId
    };

    console.log(`\n===== FINAL COMBINED PAYLOAD FOR ${smVendorId} =====`);
    console.log(JSON.stringify(oCombined, null, 2));

    return oCombined;
  }

  // ============================================================
  // STEP 6 — BUILD PQ TRIGGER REQUEST BODY
  // ============================================================
  function buildPQTriggerBody(combined) {

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    const formattedEndDate = endDate.toLocaleDateString("en-GB");

    return {
      aribaLifeCycle   : "Qualification",
      templateId       : combined.templateId,
      templateProcessId: combined.templateProcessId,
      processType      : "Qualification",

      expiryDetail: {
        expiryOffset            : combined.expiryOffset,
        expiryFrequency         : combined.expiryFrequency,
        expiryReminderOffset    : combined.expiryReminderOffset,
        expiryReminderFrequency : combined.expiryReminderFrequency
      },

      smProcessVendors: [
        {
          smVendorId: combined.smVendorId
        }
      ],

      matrix: {
        categoryIds   : combined.categories, // commodity codes
        regionIds     : combined.regions,
        departmentIds : [],
        materialIds   : []
      },

      questionnaires: [
        {
          internalId         : combined.internalId,
          questionnaireType  : "Qualification",
          requestUpdate      : true,
          isInternal         : false,
          isRequired         : true,
          sendToUser         : true,
          recipient          : {}
        }
      ],

      answers: [
        {
          // CATEGORY answer → mapped productCategory from CSV
          itemId                      : combined.categoryItemId,
          externalSystemCorrelationId : combined.categoryCorrelationId,
          multiValueAnswer            : combined.mappedCategories
        },
        {
          // COMMODITY answer → Ariba categoryIds
          itemId                      : combined.commodityItemId,
          externalSystemCorrelationId : combined.commodityCorrelationId,
          multiValueAnswer            : combined.categories
        },
        {
          // REGION answer → Ariba regionIds
          itemId                      : combined.regionItemId,
          externalSystemCorrelationId : combined.regionCorrelationId,
          multiValueAnswer            : combined.regions
        },
        {
          itemId                      : combined.endDateItemId,
          externalSystemCorrelationId : combined.endDateCorrelationId,
          answer                      : formattedEndDate
        }
      ],

      processCreationMessage: `Process triggered on ${new Date().toLocaleString()}`,
      initiatorName         : combined.initiatorName
    };
  }

//   // ============================================================
//   // STEP 7 — TRIGGER PQ
//   // ============================================================
//   async function triggerPQ(pqBody, token) {
//     try {
//       const url = "https://mn1.openapi.ariba.com/api/supplierdatapagination/v4/prod/processes/processCreateRequests?realm=746138565-T";

//       const headers = {
//         "apiKey"       : "PvYjyxNHJjwBUN3xTwezHbh9MutVFNgg",
//         "Content-Type" : "application/json",
//         "Authorization": `Bearer ${token}`
//       };

//       console.log("\n===== SENDING PQ TRIGGER REQUEST =====");
//       console.log(JSON.stringify(pqBody, null, 2));

//       const response = await axios.post(url, pqBody, { headers });

//       console.log("\n===== PQ TRIGGER RESPONSE =====");
//       console.log(JSON.stringify(response.data, null, 2));

//       return response.data;

//     } catch (err) {
//       console.error("❌ PQ Trigger Failed");
//       console.error(err.response?.data || err);

//       // ⭐ EMAIL TRIGGER — PQ FAILURE
//       const stepName = "PQ Trigger";
//       const reasonDescription = "PQ API returned an error.";

//      // const emailBody = buildErrorEmail(
//      //   pqBody,
//        // stepName,
//        // err.message || JSON.stringify(err.response?.data),
//         //reasonDescription
//       //);

//      // await sendErrorEmail("PQ Trigger Failure", emailBody);

//      const htmlBody = buildErrorEmail(
//   combined,
//   stepName,
//   errorMessage,
//   reasonDescription
// );

// await sendErrorEmail(
//   `PQ Processing Failure - ${stepName}`,
//   htmlBody
// );

//       throw err;
//     }
//   }

// ============================================================
// STEP 7 — TRIGGER PQ
// ============================================================
async function triggerPQ(pqBody, token) {
  try {
    const pqTriggerServiceName = process.env.NODE_ENV === "production" ? "ARIBA_PQ_TRIGGER_PROD" : "ARIBA_PQ_TRIGGER";
    const pqTriggerService = await cds.connect.to(pqTriggerServiceName);

    console.log("\n===== SENDING PQ TRIGGER REQUEST =====");
    console.log(JSON.stringify(pqBody, null, 2));

    const response = await pqTriggerService.send({
  method : "POST",
  path   : `/processCreateRequests?realm=746138565-T`,
  headers: {
    "apiKey"       : "PvYjyxNHJjwBUN3xTwezHbh9MutVFNgg",
    "Content-Type" : "application/json",
    "Authorization": `Bearer ${token}`
  },
  data: pqBody
});

    console.log("\n===== PQ TRIGGER RESPONSE =====");
    console.log(JSON.stringify(response, null, 2));

    return response;

  } catch (err) {
    console.error("❌ PQ Trigger Failed");
    console.error(err);

    // ⭐ EMAIL TRIGGER — PQ FAILURE
    const stepName = "PQ Trigger";
    const reasonDescription = "PQ API returned an error.";

    const htmlBody = buildErrorEmail(
      pqBody,
      stepName,
      err.message || JSON.stringify(err.response?.data || err),
      reasonDescription
    );

    await sendErrorEmail(
      `PQ Processing Failure - ${stepName}`,
      htmlBody
    );

    throw err;
  }
}

  function shouldTriggerPQ(processes) {
  // No processes → trigger PQ
  if (!processes || processes.length === 0) return true;

  // Only qualification processes matter
  const pqList = processes.filter(p => p.processType === "Qualification");
  if (pqList.length === 0) return true;

  // Find latest expiry date
  let latestExpiry = 0;
  for (const p of pqList) {
    if (p.expiryDate && p.expiryDate > latestExpiry) {
      latestExpiry = p.expiryDate;
    }
  }

  // No expiry date → treat as expired
  if (latestExpiry === 0) return true;

  const expiryDate = new Date(latestExpiry);
  const today = new Date();

  // Trigger PQ only if expired
  return expiryDate <= today;
}

  

  // ============================================================
// STEP 8 — FULL BACKGROUND JOB (ALL STEPS)
// ============================================================
async function runFullPQBackgroundJob() {
  try {
    console.log("\n================ RUN PQ BACKGROUND JOB ====================");

    const token = await getOAuthToken();

    const updatedDateFrom = "2026-04-01T00:00:00Z";
    const updatedDateTo   = new Date().toISOString();

    // STEP 1 — Fetch ALL registered suppliers
    const supplierResponse = await fetchRegisteredSuppliers(token, updatedDateFrom, updatedDateTo);

    // ⭐ FIX: Ariba sometimes returns an array, sometimes { result: [] }
    const suppliers = Array.isArray(supplierResponse)
      ? supplierResponse
      : supplierResponse?.result || [];

    console.log(`Total suppliers fetched: ${suppliers.length}`);

    // STEP 2 — Hardcoded vendor
    const vendorId = "S11392486";
    const supplier = suppliers.find(s => s["SM Vendor ID"] === vendorId);

    if (!supplier) {
      console.error(`❌ Supplier ${vendorId} not found in Step 1 results`);
      return;
    }

   // STEP 3 — Fetch processes for this vendor
console.log(`\n===== FETCHING PROCESSES FOR ${vendorId} =====`);
const processData = await fetchSupplierProcesses(token, vendorId);
const processes = processData?.processes || [];

// ⭐ Log expiry date for visibility
let latestExpiry = 0;
for (const p of processes) {
  if (p.expiryDate && p.expiryDate > latestExpiry) {
    latestExpiry = p.expiryDate;
  }
}
const expiryDate = latestExpiry ? new Date(latestExpiry).toISOString() : "none";
console.log(`Expiry date for ${vendorId}: ${expiryDate}`);

// STEP 4 — Expiry logic
if (!shouldTriggerPQ(processes)) {
  console.log(`⏳ PQ still valid for ${vendorId} — SKIPPING PQ TRIGGER`);
  return;
}

console.log(`🔥 PQ expired or missing for ${vendorId} — WILL TRIGGER PQ`);


    // STEP 5 — Fetch workspaces
    console.log(`\n===== FETCHING WORKSPACES FOR ${vendorId} =====`);
    await fetchVendorWorkspaces(token, vendorId);

    // STEP 6 — Build combined payload
    console.log(`\n===== BUILDING PQ PAYLOAD FOR ${vendorId} =====`);
    const combined = await buildCombinedPayload(token, supplier);

    // STEP 7 — Trigger PQ
    const pqBody = buildPQTriggerBody(combined);
    await triggerPQ(pqBody, token);

    console.log(`\n===== PQ TRIGGERED SUCCESSFULLY FOR ${vendorId} =====`);

  } catch (err) {
    console.error("FULL PQ BACKGROUND JOB FAILED:", err);
  }
}


  // ============================================================
  // ACTION: UploadCommodityMappings (UI5 CSV Upload)
  // ============================================================
  this.on("UploadCommodityMappings", async (req) => {
    const { csvContent } = req.data;

    if (!csvContent || !csvContent.trim()) {
      return req.error(400, "CSV content is empty");
    }

    const db       = await cds.connect.to("db");
    const Mappings = db.entities.CommodityCategoryMappings;

    const lines = csvContent.trim().split("\n");
    const start = lines[0].toLowerCase().includes("commodity") ? 1 : 0;

    const rows = lines
      .slice(start)
      .map(line => {
        const cols = line.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
        return {
          commodityCode   : cols[0] || null,
          commodityDesc   : cols[1] || "",
          productCategory : cols[2] || ""
        };
      })
      .filter(r => r.commodityCode);

    if (rows.length === 0) {
      return req.error(400, "No valid rows found in CSV");
    }

    let inserted = 0;
    let updated  = 0;

    for (const row of rows) {
      const existing = await SELECT.one
        .from(Mappings)
        .where({ commodityCode: row.commodityCode });

      if (existing) {
        await UPDATE(Mappings)
          .set({
            commodityDesc   : row.commodityDesc,
            productCategory : row.productCategory
          })
          .where({ commodityCode: row.commodityCode });
        updated++;
      } else {
        await INSERT.into(Mappings).entries({
          ID              : cds.utils.uuid(),
          commodityCode   : row.commodityCode,
          commodityDesc   : row.commodityDesc,
          productCategory : row.productCategory
        });
        inserted++;
      }
    }

    console.log(`CSV Upload — inserted: ${inserted}, updated: ${updated}`);

    // ⭐ After CSV upload is done, run the full PQ background job
    await runFullPQBackgroundJob();

    return inserted + updated;
  });

  // ============================================================
  // ACTION: FetchRegisteredSuppliers (UI5 Trigger)
  // ============================================================
  this.on("FetchRegisteredSuppliers", async (req) => {
    const { updatedDateFrom, updatedDateTo } = req.data;

    console.log("\n=========== START: FetchRegisteredSuppliers Action ===========");

    const token     = await getOAuthToken();
    const suppliers = await fetchRegisteredSuppliers(token, updatedDateFrom, updatedDateTo);

    console.log("=========== END: FetchRegisteredSuppliers Action ===========\n");

    return JSON.stringify(suppliers);
  });

  // ============================================================
  // OPTIONAL DEBUG MODE — AUTO RUN ON SERVER START
  // ============================================================
  /*
  cds.on("served", async () => {
    try {
      console.log("\n\n================ DEBUG MODE: TRIGGER PQ FOR ONE VENDOR ================");

      const updatedDateFrom = "2026-04-01T00:00:00Z";
      const updatedDateTo   = new Date().toISOString();

      const token = await getOAuthToken();

      const supplierResponse = await fetchRegisteredSuppliers(token, updatedDateFrom, updatedDateTo);
      const suppliers        = Array.isArray(supplierResponse) ? supplierResponse : [];

      const vendorId = "S11382991";
      const supplier = suppliers.find(s => s["SM Vendor ID"] === vendorId);

      if (!supplier) {
        console.error(`❌ Supplier ${vendorId} not found`);
        return;
      }

      const combined = await buildCombinedPayload(token, supplier);
      const pqBody   = buildPQTriggerBody(combined);

      await triggerPQ(pqBody, token);

      console.log(`\n===== PQ TRIGGERED SUCCESSFULLY FOR ${vendorId} =====`);

    } catch (err) {
      console.error("DEBUG MODE FAILED:", err);
    }
  });
  */

  // ============================================================
// AUTO PQ JOB ON SERVER START
// ============================================================
cds.on("served", async () => {
  try {
    console.log("\n\n================ AUTO PQ JOB ON SERVER START ================");

    await runFullPQBackgroundJob();

    console.log("\n===== AUTO PQ JOB COMPLETED SUCCESSFULLY =====");

  } catch (err) {
    console.error("AUTO PQ JOB FAILED:", err);
  }
});




}); // END OF SERVICE IMPLEMENTATION
