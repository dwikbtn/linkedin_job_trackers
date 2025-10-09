import { SmartCaptureState, SmartCaptureStep, ElementInfo, CONTENT_ROOT_ID } from "./types";
import { sendMessage } from "./messaging";

/**
 * Smart Capture UI Manager - handles overlay, element selection, and step progression
 */
export class SmartCaptureUI {
  private state: SmartCaptureState;
  private overlay: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private highlightBox: HTMLElement | null = null;
  private tooltip: HTMLElement | null = null;
  private originalStyles: Map<HTMLElement, string> = new Map();
  private isProcessingSelection: boolean = false;
  private shadowRootContainer: HTMLElement | null = null;

  constructor(shadowRootContainer?: HTMLElement) {
    this.shadowRootContainer = shadowRootContainer || null;
    this.state = {
      isActive: false,
      currentStep: 0,
      steps: [
        {
          id: "jobTitle",
          title: "Select Job Title",
          description: "Click on the element that contains the job title",
          completed: false,
        },
        {
          id: "company",
          title: "Select Company Name",
          description: "Click on the element that contains the company name",
          completed: false,
        },
        {
          id: "applyButton",
          title: "Select Apply Button",
          description:
            "Click on the button/element that triggers the job application",
          completed: false,
        },
      ],
    };
  }

  /**
   * Get the shadow root container element
   */
  private getShadowRootContainer(): HTMLElement {
    // Use the passed shadow root container if available
    if (this.shadowRootContainer) {
      return this.shadowRootContainer;
    }

    // First, try to find the shadow host element
    const shadowHost = document.querySelector('[data-shadow-host]') || 
                      document.querySelector('.extension-shadow-host') ||
                      document.getElementById('extension-root');
    
    if (shadowHost && shadowHost.shadowRoot) {
      const container = shadowHost.shadowRoot.getElementById(CONTENT_ROOT_ID);
      if (container) {
        return container;
      }
    }
    
    // Alternative: if the shadow root is attached to a known element
    const hostElements = document.querySelectorAll('*');
    for (const element of hostElements) {
      if (element.shadowRoot) {
        const container = element.shadowRoot.getElementById(CONTENT_ROOT_ID);
        if (container) {
          return container;
        }
      }
    }
    
    console.warn(`Shadow root container with id "${CONTENT_ROOT_ID}" not found, falling back to document.body`);
    return document.body;
  }

  /**
   * Start the Smart Capture process
   */
  startCapture(): void {
    if (this.state.isActive) return;

    this.state.isActive = true;
    this.state.currentStep = 0;
    this.isProcessingSelection = false; // Reset processing flag
    this.createOverlay();
    this.createModal();
    this.createHighlightBox();
    this.createTooltip();
    this.showInstructionModal();
  }

  /**
   * Stop the Smart Capture process
   */
  stopCapture(): void {
    if (!this.state.isActive) return;

    this.state.isActive = false;
    this.cleanup();
  }

  /**
   * Create the overlay background
   */
  private createOverlay(): void {
    this.overlay = document.createElement("div");
    this.overlay.className = "smart-capture-overlay";
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(2px);
      z-index: 999999;
      pointer-events: auto;
    `;

    this.getShadowRootContainer().appendChild(this.overlay);
  }

  /**
   * Create the modal dialog
   */
  private createModal(): void {
    this.modal = document.createElement("div");
    this.modal.className = "smart-capture-modal";
    this.modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 28rem;
      width: 90vw;
      padding: 2rem;
      z-index: 1000000;
      pointer-events: auto;
    `;

    if (this.overlay) {
      this.overlay.appendChild(this.modal);
    }
  }

  /**
   * Create the highlight box for hovering elements
   */
  private createHighlightBox(): void {
    this.highlightBox = document.createElement("div");
    this.highlightBox.className = "smart-capture-highlight";
    this.highlightBox.style.cssText = `
      position: absolute;
      border: 4px solid #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 8px;
      pointer-events: none;
      z-index: 999998;
      transition: all 0.2s ease;
      display: none;
    `;
    this.getShadowRootContainer().appendChild(this.highlightBox);
  }

  /**
   * Create tooltip for element information
   */
  private createTooltip(): void {
    this.tooltip = document.createElement("div");
    this.tooltip.className = "smart-capture-tooltip";
    this.tooltip.style.cssText = `
      position: fixed;
      background: rgba(17, 24, 39, 0.95);
      color: white;
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      z-index: 999999;
      pointer-events: none;
      backdrop-filter: blur(2px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: none;
      max-width: 200px;
      word-wrap: break-word;
    `;
    this.getShadowRootContainer().appendChild(this.tooltip);
  }

  /**
   * Setup event listeners for element selection
   */
  private setupEventListeners(): void {
    document.addEventListener("mouseover", this.handleMouseOver.bind(this));
    document.addEventListener("mouseout", this.handleMouseOut.bind(this));
    document.addEventListener("click", this.handleClick.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    document.removeEventListener("mouseover", this.handleMouseOver.bind(this));
    document.removeEventListener("mouseout", this.handleMouseOut.bind(this));
    document.removeEventListener("click", this.handleClick.bind(this));
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  /**
   * Handle mouse over events
   */
  private handleMouseOver(event: MouseEvent): void {
    if (!this.state.isActive) return;

    const target = event.target as HTMLElement;

    // Skip our own overlay elements
    if (this.isOverlayElement(target)) return;

    this.highlightElement(target);
    this.showTooltip(event, target);
  }

  /**
   * Handle mouse out events
   */
  private handleMouseOut(): void {
    if (!this.state.isActive) return;
    this.hideHighlight();
    this.hideTooltip();
  }

  /**
   * Handle click events for element selection
   */
  private handleClick(event: MouseEvent): void {
    if (!this.state.isActive) return;

    const target = event.target as HTMLElement;

    // Skip our own overlay elements
    if (this.isOverlayElement(target)) return;

    // Prevent the default action and stop propagation immediately
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    console.log("Click detected on element:", {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      currentStep: this.state.currentStep,
      isProcessing: this.isProcessingSelection,
    });

    this.selectElement(target);
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.state.isActive) return;

    if (event.key === "Escape") {
      this.stopCapture();
    }
  }

  /**
   * Check if element is part of our overlay
   */
  private isOverlayElement(element: HTMLElement): boolean {
    return !!(
      this.overlay?.contains(element) ||
      this.modal?.contains(element) ||
      element === this.highlightBox ||
      element === this.tooltip
    );
  }

  /**
   * Highlight an element
   */
  private highlightElement(element: HTMLElement): void {
    if (!this.highlightBox) return;

    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    this.highlightBox.style.display = "block";
    this.highlightBox.style.left = `${rect.left + scrollX}px`;
    this.highlightBox.style.top = `${rect.top + scrollY}px`;
    this.highlightBox.style.width = `${rect.width}px`;
    this.highlightBox.style.height = `${rect.height}px`;
    this.highlightBox.style.borderColor = "#eab308";
    this.highlightBox.style.backgroundColor = "rgba(234, 179, 8, 0.1)";
  }

  /**
   * Hide highlight
   */
  private hideHighlight(): void {
    if (this.highlightBox) {
      this.highlightBox.style.display = "none";
    }
  }

  /**
   * Show tooltip with element information
   */
  private showTooltip(event: MouseEvent, element: HTMLElement): void {
    if (!this.tooltip) return;

    const text = this.getElementText(element);
    const tagName = element.tagName.toLowerCase();

    this.tooltip.textContent = `${tagName}: ${text}`;
    this.tooltip.style.display = "block";
    this.tooltip.style.left = `${event.clientX + 10}px`;
    this.tooltip.style.top = `${event.clientY - 30}px`;
  }

  /**
   * Hide tooltip
   */
  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.style.display = "none";
    }
  }

  /**
   * Select an element for the current step
   */
  private selectElement(element: HTMLElement): void {
    const currentStep = this.state.steps[this.state.currentStep];
    if (!currentStep) return;

    // Prevent multiple rapid selections
    if (this.isProcessingSelection) {
      console.log("Selection already in progress, ignoring...");
      return;
    }

    this.isProcessingSelection = true;

    const selector = this.generateSelector(element);
    const text = this.getElementText(element);

    currentStep.selector = selector;
    currentStep.previewText = text;
    currentStep.completed = true;

    console.log(`Step ${this.state.currentStep} completed:`, {
      stepId: currentStep.id,
      selector: selector,
      text: text,
      totalSteps: this.state.steps.length,
    });

    // Highlight selected element briefly
    if (this.highlightBox) {
      this.highlightBox.style.borderColor = "#10b981";
      this.highlightBox.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
    }

    // Hide floating instruction
    const floatingInstruction = document.getElementById(
      "smart-capture-floating-instruction"
    );
    if (floatingInstruction) {
      floatingInstruction.style.display = "none";
    }

    // Remove event listeners temporarily
    this.removeEventListeners();

    // Add a small delay to prevent rapid successive selections
    setTimeout(() => {
      // Move to next step or complete
      if (this.state.currentStep < this.state.steps.length - 1) {
        this.state.currentStep++;
        console.log(
          `Moving to step ${this.state.currentStep} (${
            this.state.steps[this.state.currentStep].id
          })`
        );
        // Show overlay and modal with next step
        if (this.overlay) {
          this.overlay.style.display = "block";
        }
        if (this.modal) {
          this.modal.style.display = "block";
          this.updateModal();
        }
      } else {
        console.log("All steps completed, calling completeCapture()");
        this.completeCapture();
      }

      // Reset the processing flag
      this.isProcessingSelection = false;
    }, 300);
  }

  /**
   * Generate a CSS selector for an element
   */
  private generateSelector(element: HTMLElement): string {
    // Try ID first
    if (element.id) {
      return `#${element.id}`;
    }

    // Try class names
    if (element.className && typeof element.className === "string") {
      const classes = element.className.trim().split(/\s+/);
      if (classes.length > 0) {
        return `.${classes.join(".")}`;
      }
    }

    // Try data attributes
    for (const attr of element.attributes) {
      if (attr.name.startsWith("data-") && attr.value) {
        return `[${attr.name}="${attr.value}"]`;
      }
    }

    // Fallback to tag name with nth-child
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element) + 1;
      return `${element.tagName.toLowerCase()}:nth-child(${index})`;
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Get meaningful text content from an element
   */
  private getElementText(element: HTMLElement): string {
    // Try direct text content first
    let text = element.textContent?.trim() || "";

    // If no text, try common attributes
    if (!text) {
      text =
        element.getAttribute("aria-label") ||
        element.getAttribute("title") ||
        element.getAttribute("alt") ||
        element.getAttribute("placeholder") ||
        "No text content";
    }

    // Truncate if too long
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  }

  /**
   * Show initial instruction modal before starting element selection
   */
  private showInstructionModal(): void {
    if (!this.modal) return;

    const currentStep = this.state.steps[this.state.currentStep];

    this.modal.innerHTML = `
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Smart Capture</h2>
        <p class="text-gray-600">Ready to teach the extension which elements to capture automatically</p>
      </div>

      <!-- Steps Overview -->
      <div class="space-y-3 mb-6">
        <div class="bg-blue-50/80 border border-blue-200 rounded-xl p-4">
          <h3 class="text-sm font-semibold text-blue-800 mb-2">What you'll do:</h3>
          <ol class="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>Click "Start Selection" to begin</li>
            <li>Click the job title element on the page</li>
            <li>Click the company name element</li>
            <li>Click the apply/submit button</li>
            <li>Review and save your selections</li>
          </ol>
        </div>
        
        <div class="bg-yellow-50/80 border border-yellow-200 rounded-xl p-4">
          <h3 class="text-sm font-semibold text-yellow-800 mb-2">Current Step:</h3>
          <p class="text-xs text-yellow-700">
            <strong>${currentStep.title}:</strong> ${currentStep.description}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button id="smart-capture-cancel-btn" class="flex-1 bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400/20">
          Cancel
        </button>
        <button id="smart-capture-start-btn" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30">
          Start Selection
        </button>
      </div>
    `;

    // Add event listeners to the buttons
    const cancelBtn = this.modal.querySelector(
      "#smart-capture-cancel-btn"
    ) as HTMLButtonElement;
    const startBtn = this.modal.querySelector(
      "#smart-capture-start-btn"
    ) as HTMLButtonElement;

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.stopCapture());
    }

    if (startBtn) {
      startBtn.addEventListener("click", () => this.startSelection());
    }
  }

  /**
   * Start the actual element selection process (hide modal, enable interactions)
   */
  startSelection(): void {
    // Hide the modal to allow page interaction
    if (this.modal) {
      this.modal.style.display = "none";
    }

    // Hide the overlay to allow clicking on page elements
    if (this.overlay) {
      this.overlay.style.display = "none";
    }

    // Setup event listeners for element selection
    this.setupEventListeners();

    // Show floating instruction
    this.showFloatingInstruction();
  }

  /**
   * Show floating instruction for current step
   */
  private showFloatingInstruction(): void {
    const currentStep = this.state.steps[this.state.currentStep];

    // Create or update floating instruction
    let floatingInstruction = document.getElementById(
      "smart-capture-floating-instruction"
    ) as HTMLElement;

    if (!floatingInstruction) {
      floatingInstruction = document.createElement("div");
      floatingInstruction.id = "smart-capture-floating-instruction";
      floatingInstruction.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.6);
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        padding: 16px 24px;
        z-index: 1000000;
        pointer-events: auto;
        max-width: 400px;
        text-align: center;
      `;
      this.getShadowRootContainer().appendChild(floatingInstruction);
    }

    floatingInstruction.innerHTML = `
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-semibold text-blue-600">${
              this.state.currentStep + 1
            }</span>
          </div>
          <div class="text-left">
            <h4 class="text-sm font-semibold text-gray-900">${
              currentStep.title
            }</h4>
            <p class="text-xs text-gray-600">${currentStep.description}</p>
          </div>
        </div>
        <button id="floating-show-modal-btn" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
      <div class="mt-3 text-xs text-gray-500">
        Hover over page elements to highlight them, then click to select. Press ESC to cancel.
      </div>
    `;

    // Add event listener to the show modal button
    const showModalBtn = floatingInstruction.querySelector(
      "#floating-show-modal-btn"
    ) as HTMLButtonElement;
    if (showModalBtn) {
      showModalBtn.addEventListener("click", () => this.showModal());
    }
  }

  /**
   * Show modal again (from floating instruction)
   */
  showModal(): void {
    // Show the overlay again
    if (this.overlay) {
      this.overlay.style.display = "block";
    }

    if (this.modal) {
      this.modal.style.display = "block";
      this.updateModal();
    }

    // Hide floating instruction
    const floatingInstruction = document.getElementById(
      "smart-capture-floating-instruction"
    );
    if (floatingInstruction) {
      floatingInstruction.style.display = "none";
    }

    // Remove event listeners temporarily
    this.removeEventListeners();
  }
  private updateModal(): void {
    if (!this.modal) return;

    const currentStep = this.state.steps[this.state.currentStep];

    this.modal.innerHTML = `
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Smart Capture</h2>
        <p class="text-gray-600">Teach the extension which elements to capture automatically</p>
      </div>

      <!-- Progress -->
      <div class="flex items-center space-x-3 mb-6">
        ${this.state.steps
          .map(
            (step, index) => `
          <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            index < this.state.currentStep
              ? "border-green-500 text-white bg-green-500"
              : index === this.state.currentStep
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-gray-300 text-gray-400 bg-white"
          }">
            ${index < this.state.currentStep ? "✓" : index + 1}
          </div>
          ${
            index < this.state.steps.length - 1
              ? `<div class="flex-1 h-0.5 bg-gray-200 transition-all duration-300 ${
                  index < this.state.currentStep ? "bg-green-500" : ""
                }"></div>`
              : ""
          }
        `
          )
          .join("")}
      </div>

      <!-- Current Step -->
      <div class="bg-white/80 backdrop-blur-sm border-2 border-blue-500/60 rounded-2xl p-6 transition-all duration-300 ring-4 ring-blue-500/20 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">${
          currentStep.title
        }</h3>
        <p class="text-gray-600 mb-4">${currentStep.description}</p>
        
        <div class="bg-blue-50/80 border border-blue-200/60 rounded-xl p-4 mb-4">
          <p class="text-xs text-blue-700">
            <strong>Instructions:</strong> Click "Continue Selection" below, then hover over page elements to highlight them and click to select.
          </p>
        </div>
        
        ${
          currentStep.previewText
            ? `
          <div class="bg-gray-50/80 border border-gray-200/60 rounded-xl p-4 font-mono text-sm">
            <div class="text-xs font-semibold text-gray-700 mb-1">Preview:</div>
            <div class="text-sm text-gray-900">${currentStep.previewText}</div>
          </div>
        `
            : ""
        }
      </div>

      <!-- Completed Steps -->
      ${this.state.steps
        .slice(0, this.state.currentStep)
        .map(
          (step) => `
        <div class="bg-green-50/80 backdrop-blur-sm border-2 border-green-500/60 rounded-2xl p-6 transition-all duration-300 mt-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold text-green-800">${step.title}</h4>
            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
          ${
            step.previewText
              ? `
            <div class="bg-gray-50/80 border border-gray-200/60 rounded-xl p-4 mt-2">
              <div class="text-xs text-green-700">${step.previewText}</div>
            </div>
          `
              : ""
          }
        </div>
      `
        )
        .join("")}

      <!-- Actions -->
      <div class="flex gap-3 mt-6">
        <button id="smart-capture-cancel-btn" class="flex-1 bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400/20">
          Cancel
        </button>
        ${
          this.state.currentStep > 0
            ? `
          <button id="smart-capture-previous-btn" class="bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400/20">
            Previous
          </button>
        `
            : ""
        }
        <button id="smart-capture-continue-btn" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30">
          Continue Selection
        </button>
      </div>
    `;

    // Add event listeners to the buttons
    const cancelBtn = this.modal.querySelector(
      "#smart-capture-cancel-btn"
    ) as HTMLButtonElement;
    const previousBtn = this.modal.querySelector(
      "#smart-capture-previous-btn"
    ) as HTMLButtonElement;
    const continueBtn = this.modal.querySelector(
      "#smart-capture-continue-btn"
    ) as HTMLButtonElement;

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.stopCapture());
    }

    if (previousBtn) {
      previousBtn.addEventListener("click", () => this.previousStep());
    }

    if (continueBtn) {
      continueBtn.addEventListener("click", () => this.startSelection());
    }
  }

  /**
   * Go to previous step
   */
  previousStep(): void {
    if (this.state.currentStep > 0) {
      this.state.currentStep--;
      this.state.steps[this.state.currentStep].completed = false;
      this.state.steps[this.state.currentStep].selector = undefined;
      this.state.steps[this.state.currentStep].previewText = undefined;
      this.updateModal();
    }
  }

  /**
   * Complete the capture process
   */
  private completeCapture(): void {
    console.log("Complete capture called. Current state:", {
      currentStep: this.state.currentStep,
      steps: this.state.steps.map((step) => ({
        id: step.id,
        completed: step.completed,
        selector: step.selector,
        previewText: step.previewText,
      })),
    });

    // Remove floating instruction if it exists
    const floatingInstruction = document.getElementById(
      "smart-capture-floating-instruction"
    );
    if (floatingInstruction) {
      floatingInstruction.remove();
      console.log("Removed floating instruction before completion modal");
    }

    // Collect all the captured information
    const mapping = {
      domain: window.location.hostname,
      jobTitleSelector: this.state.steps[0].selector!,
      companySelector: this.state.steps[1].selector!,
      applyButtonSelector: this.state.steps[2].selector!,
      previewJobTitle: this.state.steps[0].previewText!,
      previewCompany: this.state.steps[1].previewText!,
      createdAt: new Date().toISOString(),
    };

    console.log("Smart Capture mapping to be saved:", mapping);

    // Show overlay for completion modal
    if (this.overlay) {
      this.overlay.style.display = "block";
    }

    // Ensure modal is visible and show completion content
    if (this.modal) {
      this.modal.style.display = "block";
      this.showCompletionModal(mapping);
    } else {
      console.error("Modal element not found during completion");
    }
  }

  /**
   * Show completion modal with save option
   */
  private showCompletionModal(mapping: any): void {
    if (!this.modal) {
      console.error("Modal element not found in showCompletionModal");
      return;
    }

    console.log("Showing completion modal with mapping:", mapping);

    this.modal.innerHTML = `
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Capture Complete!</h2>
        <p class="text-gray-600">Review your selections below</p>
      </div>

      <!-- Summary -->
      <div class="space-y-4 mb-6">
        <div class="bg-gray-50 rounded-xl p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Domain</h4>
          <p class="text-sm text-gray-900">${mapping.domain}</p>
        </div>
        
        <div class="bg-gray-50 rounded-xl p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Job Title</h4>
          <p class="text-sm text-gray-900">${mapping.previewJobTitle}</p>
          <p class="text-xs text-gray-500 mt-1">Selector: ${mapping.jobTitleSelector}</p>
        </div>
        
        <div class="bg-gray-50 rounded-xl p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Company</h4>
          <p class="text-sm text-gray-900">${mapping.previewCompany}</p>
          <p class="text-xs text-gray-500 mt-1">Selector: ${mapping.companySelector}</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Apply Button</h4>
          <p class="text-sm text-gray-900">${mapping.applyButtonSelector}</p>
          <p class="text-xs text-gray-500 mt-1">Will detect clicks on this element</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button id="completion-cancel-btn" class="flex-1 bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400/20">
          Cancel
        </button>
        <button id="completion-save-btn" class="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/30">
          Save Mapping
        </button>
      </div>
    `;

    console.log("Completion modal HTML set, now adding event listeners...");

    // Add event listeners to the buttons
    const cancelBtn = this.modal.querySelector(
      "#completion-cancel-btn"
    ) as HTMLButtonElement;
    const saveBtn = this.modal.querySelector(
      "#completion-save-btn"
    ) as HTMLButtonElement;

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.stopCapture());
      console.log("Cancel button event listener added");
    } else {
      console.error("Cancel button not found in completion modal");
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveMapping(mapping));
      console.log("Save button event listener added");
    } else {
      console.error("Save button not found in completion modal");
    }

    console.log("Completion modal setup complete");
  }

  /**
   * Save the mapping and close
   */
  saveMapping(mapping: any): void {
    // Send message to save mapping
    sendMessage("saveSmartCaptureMapping", mapping);

    this.showSuccessNotification();
    this.stopCapture();
  }

  /**
   * Show success notification
   */
  private showSuccessNotification(): void {
    const notification = document.createElement("div");
    notification.textContent = "Smart Capture mapping saved successfully!";
    notification.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: rgba(34, 197, 94, 0.95);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      z-index: 999999;
      backdrop-filter: blur(2px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    this.getShadowRootContainer().appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Clean up all overlay elements and event listeners
   */
  private cleanup(): void {
    // Remove event listeners
    document.removeEventListener("mouseover", this.handleMouseOver.bind(this));
    document.removeEventListener("mouseout", this.handleMouseOut.bind(this));
    document.removeEventListener("click", this.handleClick.bind(this));
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));

    // Remove overlay elements
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    if (this.highlightBox) {
      this.highlightBox.remove();
      this.highlightBox = null;
    }

    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }

    // Remove floating instruction if it exists
    const floatingInstruction = document.getElementById(
      "smart-capture-floating-instruction"
    );
    if (floatingInstruction) {
      floatingInstruction.remove();
    }

    // Reset state
    this.state.isActive = false;
    this.state.currentStep = 0;
    this.isProcessingSelection = false; // Reset processing flag
    this.state.steps.forEach((step) => {
      step.completed = false;
      step.selector = undefined;
      step.previewText = undefined;
    });
  }
}

// Make it globally accessible for onclick handlers
declare global {
  interface Window {
    smartCaptureUI?: SmartCaptureUI;
  }
}
