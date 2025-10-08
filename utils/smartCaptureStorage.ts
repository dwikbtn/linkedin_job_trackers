import { storage } from "#imports";
import { SmartCaptureMapping } from "./types";

const SMART_CAPTURE_MAPPINGS_KEY = "smartCaptureMappings";

export class SmartCaptureStorage {
  /**
   * Save a smart capture mapping for a specific domain
   */
  static async saveMapping(mapping: SmartCaptureMapping): Promise<void> {
    try {
      const existingMappings = await this.getAllMappings();

      // Remove existing mapping for the same domain if it exists
      const filteredMappings = existingMappings.filter(
        (m) => m.domain !== mapping.domain
      );

      // Add the new mapping
      const updatedMappings = [...filteredMappings, mapping];

      await storage.setItem(
        `local:${SMART_CAPTURE_MAPPINGS_KEY}`,
        updatedMappings
      );

      console.log("Smart capture mapping saved for domain:", mapping.domain);
    } catch (error) {
      console.error("Error saving smart capture mapping:", error);
      throw error;
    }
  }

  /**
   * Get all smart capture mappings
   */
  static async getAllMappings(): Promise<SmartCaptureMapping[]> {
    try {
      const mappings = (await storage.getItem(
        `local:${SMART_CAPTURE_MAPPINGS_KEY}`
      )) as SmartCaptureMapping[] | undefined;
      return mappings || [];
    } catch (error) {
      console.error("Error retrieving smart capture mappings:", error);
      return [];
    }
  }

  /**
   * Get smart capture mapping for a specific domain
   */
  static async getMappingForDomain(
    domain: string
  ): Promise<SmartCaptureMapping | null> {
    try {
      const mappings = await this.getAllMappings();
      return mappings.find((mapping) => mapping.domain === domain) || null;
    } catch (error) {
      console.error("Error retrieving mapping for domain:", domain, error);
      return null;
    }
  }

  /**
   * Delete smart capture mapping for a specific domain
   */
  static async deleteMapping(domain: string): Promise<void> {
    try {
      const existingMappings = await this.getAllMappings();
      const filteredMappings = existingMappings.filter(
        (m) => m.domain !== domain
      );

      await storage.setItem(
        `local:${SMART_CAPTURE_MAPPINGS_KEY}`,
        filteredMappings
      );

      console.log("Smart capture mapping deleted for domain:", domain);
    } catch (error) {
      console.error("Error deleting smart capture mapping:", error);
      throw error;
    }
  }

  /**
   * Get current domain from URL
   */
  static getCurrentDomain(): string {
    try {
      const url = new URL(window.location.href);
      return url.hostname;
    } catch (error) {
      console.error("Error getting current domain:", error);
      return window.location.hostname;
    }
  }

  /**
   * Check if smart capture is configured for current domain
   */
  static async isConfiguredForCurrentDomain(): Promise<boolean> {
    const currentDomain = this.getCurrentDomain();
    const mapping = await this.getMappingForDomain(currentDomain);
    return mapping !== null;
  }
}
