sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
  "use strict";

  return Controller.extend("config.controller.View1", {

    onInit: function () {
     // CSV preview model
  const savedRows = JSON.parse(localStorage.getItem("previewRows") || "[]");
  const previewModel = new JSONModel({ rows: savedRows });
  this.getView().setModel(previewModel, "preview");
  this._csvContent = null;

  // Email model — start empty, load from HANA below
  const emailModel = new JSONModel({ EmailRecipients: [] });
  this.getView().setModel(emailModel);

  // Load emails from HANA
  this._loadEmails();

  // Load PQ config from HANA
  console.log("onInit fired in deployed app");

  this._loadPQConfig();
    },

    /* ============================================================
     * NEW: LOAD PQ CONFIG FROM HANA ON INIT
     * ============================================================ */

    _loadPQConfig: function () {
  $.ajax({
    url     : "odata/v4/admin/PQConfig?$top=1",
    method  : "GET",
    headers : { "Accept": "application/json" },
    success : (oData) => {
      const aRecords = oData.value || [];

      if (aRecords.length === 0) {
        console.log("No PQConfig found in DB yet.");
        return;
      }

      const oConfig = aRecords[0];
      this._existingConfigId = oConfig.ID;

      // Populate input fields
      this.byId("templateId").setValue(oConfig.templateId || "");
      this.byId("templateProcessId").setValue(oConfig.templateProcessId || "");
      this.byId("expiryOffset").setValue(oConfig.expiryOffset || "");
      this.byId("expiryReminderOffset").setValue(oConfig.expiryReminderOffset || "");
      this.byId("internalId").setValue(oConfig.internalId || "");
      this.byId("categoryItemId").setValue(oConfig.categoryItemId || "");
      this.byId("categoryCorrelationId").setValue(oConfig.categoryCorrelationId || "");
      this.byId("commodityItemId").setValue(oConfig.commodityItemId || "");
      this.byId("commodityCorrelationId").setValue(oConfig.commodityCorrelationId || "");
      this.byId("regionItemId").setValue(oConfig.regionItemId || "");
      this.byId("regionCorrelationId").setValue(oConfig.regionCorrelationId || "");
      this.byId("endDateItemId").setValue(oConfig.endDateItemId || "");
      this.byId("endDateCorrelationId").setValue(oConfig.endDateCorrelationId || "");

      // Populate dropdowns
      this.byId("expiryFrequency").setSelectedKey(oConfig.expiryFrequency || "Days");
      this.byId("expiryReminderFrequency").setSelectedKey(oConfig.expiryReminderFrequency || "Days");

      console.log("PQConfig loaded successfully:", oConfig.ID);
    },
    error : (xhr) => {
      console.error("Failed to load PQConfig:", xhr.responseText);
    }
  });
},
    /* ============================================================
     * NEW: SAVE PQ CONFIG TO HANA — POST if new, PATCH if exists
     * ============================================================ */

   onSavePQConfig: function () {
  const oPayload = {
    templateId              : this.byId("templateId").getValue().trim(),
    templateProcessId       : this.byId("templateProcessId").getValue().trim(),
    expiryOffset            : parseInt(this.byId("expiryOffset").getValue()) || 0,
    expiryFrequency         : this.byId("expiryFrequency").getSelectedKey(),
    expiryReminderOffset    : parseInt(this.byId("expiryReminderOffset").getValue()) || 0,
    expiryReminderFrequency : this.byId("expiryReminderFrequency").getSelectedKey(),
    internalId              : this.byId("internalId").getValue().trim(),
    categoryItemId          : this.byId("categoryItemId").getValue().trim(),
    categoryCorrelationId   : this.byId("categoryCorrelationId").getValue().trim(),
    commodityItemId         : this.byId("commodityItemId").getValue().trim(),
    commodityCorrelationId  : this.byId("commodityCorrelationId").getValue().trim(),
    regionItemId            : this.byId("regionItemId").getValue().trim(),
    regionCorrelationId     : this.byId("regionCorrelationId").getValue().trim(),
    endDateItemId           : this.byId("endDateItemId").getValue().trim(),
    endDateCorrelationId    : this.byId("endDateCorrelationId").getValue().trim()
  };

  if (!oPayload.templateId) {
    MessageBox.error("Template ID is required.");
    return;
  }

  const oModel  = this.getView().getModel();
  const sMethod = this._existingConfigId ? "PATCH" : "POST";
  const sUrl    = this._existingConfigId
    ? "odata/v4/admin/PQConfig(" + this._existingConfigId + ")"
    : "odata/v4/admin/PQConfig";

  // Step 1: fetch CSRF token first
  $.ajax({
    url     : "odata/v4/admin/",
    method  : "GET",
    headers : { "X-CSRF-Token": "Fetch" },
    success : (data, status, xhr) => {
      const sToken = xhr.getResponseHeader("X-CSRF-Token");

      // Step 2: POST or PATCH with token
      $.ajax({
        url         : sUrl,
        method      : sMethod,
        contentType : "application/json",
        headers     : { "X-CSRF-Token": sToken },
        data        : JSON.stringify(oPayload),
        success     : (oData) => {
          if (sMethod === "POST") {
            this._existingConfigId = oData.ID;
          }
          MessageToast.show("PQ Configuration saved successfully");
          oModel.refresh();
        },
        error : (xhr) => {
          console.error("Save failed:", xhr.responseText);
          MessageBox.error("Failed to save PQ Configuration: " + xhr.statusText);
        }
      });
    },
    error: (xhr) => {
      console.error("CSRF fetch failed:", xhr.responseText);
      MessageBox.error("Failed to get CSRF token.");
    }
  });
},
    /* ============================================================
     * EMAIL SECTION — EXISTING LOGIC UNCHANGED
     * ============================================================ */

    onAddEmail: function () {
  const sEmail = this.byId("emailInput").getValue().trim();

  if (!sEmail) {
    MessageBox.error("Please enter an email address.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sEmail)) {
    MessageBox.error("Please enter a valid email address.");
    return;
  }

  // ── Check duplicate in local model first ──
  const oModel    = this.getView().getModel();
  const recipients = oModel.getProperty("/EmailRecipients") || [];

  if (recipients.some(r => r.email === sEmail)) {
    MessageBox.warning("Email already exists.");
    return;
  }

  // ── Save to HANA via OData ──
  $.ajax({
    url     : "odata/v4/admin/",
    method  : "GET",
    headers : { "X-CSRF-Token": "Fetch" },
    success : (data, status, xhr) => {
      const sToken = xhr.getResponseHeader("X-CSRF-Token");

      $.ajax({
        url         : "odata/v4/admin/EmailRecipients",
        method      : "POST",
        contentType : "application/json",
        headers     : { "X-CSRF-Token": sToken },
        data        : JSON.stringify({ email: sEmail }),
        success     : (oData) => {
          // also update local model and localStorage
          recipients.push({ email: sEmail, ID: oData.ID });
          oModel.setProperty("/EmailRecipients", recipients);
          localStorage.setItem("emailRecipients", JSON.stringify(recipients));

          this.byId("emailInput").setValue("");
          MessageToast.show("Email added successfully");
        },
        error : (xhr) => {
          console.error("Add email failed:", xhr.responseText);
          MessageBox.error("Failed to save email: " + xhr.statusText);
        }
      });
    },
    error: (xhr) => {
      MessageBox.error("Failed to get CSRF token.");
    }
  });
},


_loadEmails: function () {
  $.ajax({
    url     : "odata/v4/admin/EmailRecipients",
    method  : "GET",
    headers : { "Accept": "application/json" },
    success : (oData) => {
      const aEmails = oData.value || [];
      const oModel  = this.getView().getModel();
      oModel.setProperty("/EmailRecipients", aEmails);
      localStorage.setItem("emailRecipients", JSON.stringify(aEmails));
    },
    error : (xhr) => {
      console.warn("Could not load emails from HANA, using localStorage fallback");
      const savedEmails = JSON.parse(localStorage.getItem("emailRecipients") || "[]");
      this.getView().getModel().setProperty("/EmailRecipients", savedEmails);
    }
  });
},

onDeleteEmail: function (oEvent) {
  const oModel     = this.getView().getModel();
  const recipients = oModel.getProperty("/EmailRecipients") || [];

  const item  = oEvent.getSource().getParent();
  const index = this.byId("emailTable").indexOfItem(item);

  if (index < 0) return;

  const oEmail = recipients[index];

  if (!oEmail || !oEmail.ID) {
    // fallback — no ID, just remove from local model
    recipients.splice(index, 1);
    oModel.setProperty("/EmailRecipients", recipients);
    localStorage.setItem("emailRecipients", JSON.stringify(recipients));
    MessageToast.show("Email removed");
    return;
  }

  // ── Delete from HANA via OData ──
  $.ajax({
    url     : "odata/v4/admin/",
    method  : "GET",
    headers : { "X-CSRF-Token": "Fetch" },
    success : (data, status, xhr) => {
      const sToken = xhr.getResponseHeader("X-CSRF-Token");

      $.ajax({
        url     : "odata/v4/admin/EmailRecipients(" + oEmail.ID + ")",
        method  : "DELETE",
        headers : { "X-CSRF-Token": sToken },
        success : () => {
          recipients.splice(index, 1);
          oModel.setProperty("/EmailRecipients", recipients);
          localStorage.setItem("emailRecipients", JSON.stringify(recipients));
          MessageToast.show("Email deleted successfully");
        },
        error : (xhr) => {
          console.error("Delete email failed:", xhr.responseText);
          MessageBox.error("Failed to delete email: " + xhr.statusText);
        }
      });
    },
    error: (xhr) => {
      MessageBox.error("Failed to get CSRF token.");
    }
  });
},
    /* ============================================================
     * CSV UPLOAD SECTION — EXISTING LOGIC UNCHANGED
     * ============================================================ */

    onFileChange: function (oEvent) {
      const file = oEvent.getParameter("files")[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this._csvContent = e.target.result;
        const rows = this._parseCsv(this._csvContent);

        const model = this.getView().getModel("preview");
        const combined = model.getProperty("/rows").concat(rows);

        model.setProperty("/rows", combined);
        localStorage.setItem("previewRows", JSON.stringify(combined));

        this.byId("btnUpload").setEnabled(true);
      };
      reader.readAsText(file);
    },

    _parseCsv: function (csv) {
      const lines = csv.split(/\r?\n/).filter(l => l.trim());
      return lines.slice(1).map(line => {
        const cols = line.split(",");
        return {
          commodityCode   : cols[0] || "",
          commodityDesc   : cols[1] || "",
          productCategory : cols[2] || "",
         
        };
      });
    },

    onClearPreview: function () {
      this.getView().getModel("preview").setProperty("/rows", []);
      this.byId("fileUploader").clear();
      this.byId("btnUpload").setEnabled(false);
      this._csvContent = null;
      localStorage.removeItem("previewRows");
      MessageToast.show("Preview cleared");
    },

   onUploadCsv: function () {
  if (!this._csvContent) {
    MessageBox.error("No CSV content loaded.");
    return;
  }

  $.ajax({
    url     : "odata/v4/admin/",
    method  : "GET",
    headers : { "X-CSRF-Token": "Fetch" },
    success : (data, status, xhr) => {
      const sToken = xhr.getResponseHeader("X-CSRF-Token");

      $.ajax({
        url         : "odata/v4/admin/UploadCommodityMappings",
        method      : "POST",
        contentType : "application/json",
        headers     : { "X-CSRF-Token": sToken },
        data        : JSON.stringify({ csvContent: this._csvContent }),
        success     : (oData) => {
          MessageToast.show("Uploaded " + oData.value + " mappings successfully");
          this.onClearPreview();
          this.getView().getModel().refresh();
        },
        error : (xhr) => {
          console.error("Upload failed:", xhr.responseText);
          MessageBox.error("Upload failed: " + xhr.statusText);
        }
      });
    },
    error: (xhr) => {
      console.error("CSRF fetch failed:", xhr.responseText);
      MessageBox.error("Failed to get CSRF token.");
    }
  });
},
  });
});