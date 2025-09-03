// Scenario schema provided by user, exported for runtime use
// Types intentionally relaxed for flexibility in UI/engine
export const scenarioSchema: any = {
  version: "1.0",
  phases: [
    "pre_offer",
    "offer",
    "contract",
    "due_diligence",
    "financing",
    "pre_close",
    "closing",
    "post_close"
  ],
  base_tasks: [
    {
      id: "proof_of_funds_or_preapproval",
      title: "Provide Proof of Funds or Pre-Approval",
      phase: "pre_offer",
      required: true,
      guidance: "Upload bank letter or lender pre-approval.",
      inputs: ["document_upload"],
      outputs: ["stored_document"],
      sla_days: 2
    },
    {
      id: "draft_offer",
      title: "Draft Offer",
      phase: "offer",
      required: true,
      guidance: "Price, deposits, contingencies, timelines.",
      inputs: ["price", "deposit_amount", "contingencies", "closing_date"],
      outputs: ["offer_pdf"],
      sla_days: 1
    },
    {
      id: "open_escrow",
      title: "Open Escrow",
      phase: "contract",
      required: true,
      depends_on: ["offer_accepted"],
      guidance: "Wire EMD. Confirm escrow instructions.",
      inputs: ["wire_confirmation"],
      outputs: ["escrow_receipt"],
      sla_days: 2
    },
    {
      id: "title_search",
      title: "Title Search & Insurance",
      phase: "due_diligence",
      required: true,
      guidance: "Order prelim. Resolve exceptions.",
      outputs: ["prelim_title_report"]
    },
    {
      id: "general_inspection",
      title: "General Home Inspection",
      phase: "due_diligence",
      required: true,
      guidance: "Schedule inspector. Review report.",
      outputs: ["inspection_report"]
    },
    {
      id: "appraisal",
      title: "Appraisal",
      phase: "financing",
      required: false,
      visible_if: { any_scenarios: ["conv_mortgage","fha","va","usda","hard_money","assumable"] },
      guidance: "Lender-ordered valuation.",
      outputs: ["appraisal_report"]
    },
    {
      id: "clear_to_close",
      title: "Clear to Close",
      phase: "pre_close",
      required: true,
      depends_on: ["loan_approval","title_clear","repairs_complete"]
    },
    {
      id: "final_walkthrough",
      title: "Final Walkthrough",
      phase: "pre_close",
      required: true,
      guidance: "Verify condition and agreed repairs.",
      outputs: ["walkthrough_checklist"]
    },
    {
      id: "close_and_record",
      title: "Close & Record",
      phase: "closing",
      required: true,
      outputs: ["recorded_deed","final_closing_statement"]
    }
  ],
  modules: {
    financing: [
      {
        key: "cash",
        adds: [],
        overrides: [
          { task_id: "appraisal", required: false, visible_if: null }
        ],
        notes: "Faster timeline. Proof of funds mandatory."
      },
      {
        key: "conv_mortgage",
        adds: [
          { id: "loan_application", title: "Complete Loan Application", phase: "financing", required: true },
          { id: "rate_lock", title: "Rate Lock Decision", phase: "financing", required: false },
          { id: "loan_conditions", title: "Satisfy Underwriting Conditions", phase: "financing", required: true, depends_on: ["appraisal"] }
        ],
        overrides: [
          { task_id: "appraisal", required: true }
        ]
      },
      {
        key: "fha",
        inherits: ["conv_mortgage"],
        adds: [
          { id: "fha_amendatory_clause", title: "FHA Amendatory Clause", phase: "contract", required: true },
          { id: "fha_minimum_property_standards", title: "MPS Repairs if Required", phase: "due_diligence", required: false }
        ]
      },
      {
        key: "va",
        inherits: ["conv_mortgage"],
        adds: [
          { id: "va_escape_clause", title: "VA Escape Clause", phase: "contract", required: true },
          { id: "va_appraiser_requirements", title: "VA MPR Compliance", phase: "due_diligence", required: false }
        ]
      },
      {
        key: "usda",
        inherits: ["conv_mortgage"],
        adds: [
          { id: "usda_eligibility", title: "USDA Property & Income Eligibility", phase: "pre_offer", required: true }
        ]
      },
      {
        key: "seller_financing",
        adds: [
          { id: "promissory_note", title: "Draft Promissory Note", phase: "contract", required: true },
          { id: "mortgage_or_deed_of_trust", title: "Record Security Instrument", phase: "closing", required: true }
        ],
        overrides: [
          { task_id: "loan_application", required: false, visible_if: null },
          { task_id: "appraisal", required: false }
        ]
      },
      {
        key: "assumable",
        adds: [
          { id: "assumption_pkg", title: "Submit Assumption Package to Lender", phase: "financing", required: true },
          { id: "release_of_liability", title: "Seller Release of Liability", phase: "closing", required: true }
        ]
      },
      {
        key: "hard_money",
        adds: [
          { id: "repair_scope_budget", title: "Repair Scope & Budget to Lender", phase: "due_diligence", required: true },
          { id: "draw_schedule", title: "Set Rehab Draw Schedule", phase: "financing", required: true }
        ],
        overrides: [
          { task_id: "rate_lock", required: false }
        ]
      },
      {
        key: "bridge_or_heloc",
        adds: [
          { id: "bridge_approval", title: "Bridge/HELOC Approval", phase: "financing", required: true }
        ]
      },
      {
        key: "exchange_1031",
        adds: [
          { id: "qi_engagement", title: "Engage Qualified Intermediary", phase: "contract", required: true },
          { id: "identify_replacements", title: "Identify Replacements (45 days)", phase: "due_diligence", required: true },
          { id: "complete_exchange", title: "Complete Exchange (180 days)", phase: "post_close", required: true }
        ]
      }
    ],
    property_type: [
      {
        key: "condo",
        adds: [
          { id: "hoa_docs", title: "Request HOA Docs & Reserves", phase: "due_diligence", required: true },
          { id: "condo_questionnaire", title: "Condo Questionnaire", phase: "financing", required: true }
        ]
      },
      {
        key: "coop",
        adds: [
          { id: "board_pkg", title: "Prepare Co-op Board Package", phase: "financing", required: true },
          { id: "board_interview", title: "Board Interview", phase: "pre_close", required: true }
        ],
        overrides: [
          { task_id: "title_search", title: "Lien/Co-op UCC Search", phase: "due_diligence" }
        ]
      },
      {
        key: "multifamily",
        adds: [
          { id: "rent_roll", title: "Collect Rent Roll", phase: "due_diligence", required: true },
          { id: "tenant_estoppels", title: "Tenant Estoppels", phase: "due_diligence", required: false }
        ]
      },
      {
        key: "new_construction",
        adds: [
          { id: "builder_contract_review", title: "Review Builder Contract", phase: "contract", required: true },
          { id: "punch_list", title: "Create Punch List", phase: "pre_close", required: true },
          { id: "warranty_docs", title: "Collect Warranties", phase: "post_close", required: true }
        ]
      },
      {
        key: "land",
        adds: [
          { id: "survey_and_perc", title: "Survey & Perc/Soils", phase: "due_diligence", required: true },
          { id: "utility_availability", title: "Verify Utilities/Zoning", phase: "due_diligence", required: true }
        ],
        overrides: [
          { task_id: "general_inspection", required: false }
        ]
      },
      {
        key: "commercial",
        adds: [
          { id: "lease_audit", title: "Lease/CAM Audit", phase: "due_diligence", required: true },
          { id: "phase1_esa", title: "Phase I ESA", phase: "due_diligence", required: true }
        ]
      }
    ],
    seller_circumstance: [
      {
        key: "estate",
        adds: [
          { id: "probate_approval", title: "Probate/Executor Authority", phase: "contract", required: true }
        ]
      },
      {
        key: "divorce",
        adds: [
          { id: "court_orders", title: "Confirm Court Orders & Signatories", phase: "contract", required: true }
        ]
      },
      {
        key: "short_sale",
        adds: [
          { id: "lender_short_sale_approval", title: "Lender Short-Sale Approval", phase: "contract", required: true }
        ],
        overrides: [
          { task_id: "close_and_record", title: "Close & Record (post-approval)" }
        ]
      },
      {
        key: "reo_foreclosure",
        adds: [
          { id: "bank_addenda", title: "Execute Bank Addenda", phase: "contract", required: true }
        ]
      },
      {
        key: "auction",
        adds: [
          { id: "bid_registration", title: "Register to Bid + Terms", phase: "pre_offer", required: true },
          { id: "nonrefundable_deposit", title: "Post Non-Refundable Deposit", phase: "offer", required: true }
        ],
        overrides: [
          { task_id: "general_inspection", required: false }
        ]
      },
      {
        key: "bankruptcy_trustee",
        adds: [
          { id: "bk_court_approval", title: "Bankruptcy Court Approval", phase: "contract", required: true }
        ]
      },
      {
        key: "government_owned",
        adds: [
          { id: "hud_va_addenda", title: "HUD/VA Addenda", phase: "contract", required: true }
        ]
      }
    ],
    legal_title: [
      {
        key: "title_defect",
        adds: [
          { id: "lien_resolution", title: "Resolve Liens/Encumbrances", phase: "due_diligence", required: true }
        ]
      },
      {
        key: "easement_needed",
        adds: [
          { id: "draft_easement", title: "Draft/Record Easement or ROW", phase: "closing", required: true }
        ]
      },
      {
        key: "landlocked",
        inherits: ["easement_needed"]
      }
    ],
    condition_environment: [
      {
        key: "as_is",
        overrides: [
          { task_id: "repairs_complete", required: false }
        ]
      },
      {
        key: "lead_radon_mold",
        adds: [
          { id: "specialty_tests", title: "Order Lead/Radon/Mold Tests", phase: "due_diligence", required: false }
        ]
      },
      {
        key: "flood_zone",
        adds: [
          { id: "elevation_cert", title: "Obtain Elevation Certificate", phase: "due_diligence", required: false },
          { id: "bind_flood_ins", title: "Bind Flood Insurance", phase: "pre_close", required: true }
        ]
      },
      {
        key: "historic",
        adds: [
          { id: "historic_review", title: "Preservation/Historic Review", phase: "due_diligence", required: false }
        ]
      }
    ],
    contract_structures: [
      {
        key: "rent_back",
        adds: [
          { id: "leaseback_addendum", title: "Leaseback Addendum", phase: "contract", required: true },
          { id: "post_close_insurance", title: "Confirm Post-Close Insurance", phase: "pre_close", required: true }
        ]
      },
      {
        key: "lease_to_own",
        adds: [
          { id: "option_contract", title: "Draft Option to Purchase", phase: "contract", required: true }
        ]
      },
      {
        key: "seller_concessions",
        adds: [
          { id: "lender_credit_ok", title: "Lender Approval of Credits", phase: "financing", required: true }
        ]
      },
      {
        key: "joint_purchase",
        adds: [
          { id: "entity_docs", title: "Entity/Operating Agreement", phase: "pre_offer", required: false }
        ]
      }
    ],
    regulatory: [
      {
        key: "zoning_variance",
        adds: [
          { id: "variance_application", title: "File Zoning Variance", phase: "due_diligence", required: false }
        ]
      },
      {
        key: "historic_district",
        adds: [
          { id: "design_review", title: "Historic Design Review", phase: "due_diligence", required: false }
        ]
      },
      {
        key: "international_buyer",
        adds: [
          { id: "firpta_tax", title: "FIRPTA/Tax Compliance", phase: "closing", required: true },
          { id: "wire_clearance", title: "International Wire Clearance", phase: "pre_close", required: true }
        ]
      },
      {
        key: "hoa_litigation",
        adds: [
          { id: "litigation_review", title: "HOA Litigation Review", phase: "due_diligence", required: false },
          { id: "escrow_holdback", title: "Establish Holdback if Needed", phase: "closing", required: false }
        ]
      }
    ],
    timing: [
      {
        key: "home_sale_contingency",
        adds: [
          { id: "list_and_sell_current", title: "List/Sell Current Home", phase: "pre_offer", required: true }
        ]
      },
      {
        key: "simultaneous_close",
        adds: [
          { id: "coord_dual_escrows", title: "Coordinate Dual Escrows", phase: "pre_close", required: true }
        ]
      },
      {
        key: "backup_offer",
        adds: [
          { id: "backup_addendum", title: "Backup Offer Addendum", phase: "contract", required: true }
        ]
      }
    ]
  },
  scenarios_catalog: [
    "cash","conv_mortgage","fha","va","usda","seller_financing","assumable","hard_money","bridge_or_heloc","exchange_1031",
    "condo","coop","multifamily","new_construction","land","commercial",
    "estate","divorce","short_sale","reo_foreclosure","auction","bankruptcy_trustee","government_owned",
    "title_defect","easement_needed","landlocked",
    "as_is","lead_radon_mold","flood_zone","historic",
    "rent_back","lease_to_own","seller_concessions","joint_purchase",
    "zoning_variance","historic_district","international_buyer","hoa_litigation",
    "home_sale_contingency","simultaneous_close","backup_offer"
  ],
  merge_rules: {
    order: ["financing","property_type","seller_circumstance","legal_title","condition_environment","contract_structures","regulatory","timing"],
    conflicts: [
      { if: "cash", then_remove: ["loan_application","rate_lock","loan_conditions"] },
      { if: "auction", then_set: [{ task_id: "general_inspection", required: false }] }
    ]
  }
};

