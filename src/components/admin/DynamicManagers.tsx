import React from "react";
import SimpleCrudManager from "./SimpleCrudManager";

export function TeamManager() {
  return (
    <SimpleCrudManager
      table="team_members"
      title="Team"
      description="People shown on the About page."
      primaryField="name"
      defaults={{ sort_order: 0, is_visible: true }}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "role", label: "Role" },
        { name: "email", label: "Email" },
        { name: "photo_url", label: "Photo URL" },
        { name: "bio", label: "Bio", type: "textarea" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "is_visible", label: "Visible", type: "boolean" },
      ]}
    />
  );
}

export function StatsManager() {
  return (
    <SimpleCrudManager
      table="site_stats"
      title="Stats"
      description="Headline numbers shown across the site."
      primaryField="label"
      defaults={{ sort_order: 0, is_visible: true }}
      fields={[
        { name: "label", label: "Label", required: true },
        { name: "value", label: "Value", required: true, placeholder: "e.g. 250+" },
        { name: "icon", label: "Icon name", placeholder: "e.g. Tractor" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "is_visible", label: "Visible", type: "boolean" },
      ]}
    />
  );
}

export function ResourcesManager() {
  return (
    <SimpleCrudManager
      table="resources"
      title="Resources"
      description="Downloads and guides. Leave 'Available' off to show “Coming soon”."
      primaryField="title"
      defaults={{ sort_order: 0, is_available: false }}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "category", label: "Category" },
        { name: "file_url", label: "File URL" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "is_available", label: "Available", type: "boolean" },
      ]}
    />
  );
}
