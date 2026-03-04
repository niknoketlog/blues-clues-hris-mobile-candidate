/**
 * App-wide config constants — mirrors web MENU_CONFIG, ROLE_LABELS, TOPBAR_CONFIG
 * Single source of truth for persona-based navigation and labels.
 */

import { UserRole } from "../services/auth";

export const MENU_CONFIG: Record<UserRole, { name: string; label: string }[]> = {
  hr: [
    { name: "Dashboard",    label: "Dashboard"    },
    { name: "Recruitment",  label: "Recruitment"  },
    { name: "Onboarding",   label: "Onboarding"   },
    { name: "Compensation", label: "Compensation" },
    { name: "Performance",  label: "Performance"  },
  ],
  manager: [
    { name: "Dashboard", label: "Dashboard" },
    { name: "Team",      label: "Team"      },
    { name: "Approvals", label: "Approvals" },
  ],
  employee: [
    { name: "Dashboard", label: "Dashboard"  },
    { name: "Profile",   label: "My Profile" },
    { name: "Documents", label: "Documents"  },
  ],
  applicant: [
    { name: "Dashboard",    label: "Dashboard" },
    { name: "Jobs",         label: "Jobs"      },
    { name: "Applications", label: "My Apps"   },
  ],
};

// Mirrors web ROLE_LABELS
export const ROLE_LABELS: Record<UserRole, string> = {
  hr:        "HR Portal",
  manager:   "Management Portal",
  employee:  "Staff Portal",
  applicant: "Candidate Portal",
};

// Mirrors web TOPBAR_CONFIG
export const SEARCH_PLACEHOLDERS: Record<UserRole, string> = {
  hr:        "Search employees...",
  manager:   "Search team members...",
  employee:  "Search...",
  applicant: "Search jobs...",
};

export const APP_NAME = "Blue's Clues";
export const APP_SUBTITLE = "HRIS";
