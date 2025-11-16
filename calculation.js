/* All JavaScript moved from VHEATPUMPTOOL1.html <script> ... </script> */
import {
  getMaterialRate,
  getRadiatorCost,
  getCylinderCost,
  getControlSystemCost,
  getCondensateDrainCost,
  getElectricalCablesCost,
  getComplexityMultiplier,
  getSystemMultiplier,
} from "./lib/materials.js";
// import { printQuote as printQuoteLib } from "./lib/print.js"; // optional

import { initMaterials } from "./lib/materials.js";

document.addEventListener("DOMContentLoaded", () => {
  initMaterials().catch((err) => {
    console.error("Material data load failed", err);
  });
});
// attach printQuote from the separate module (optional)
// window.printQuote = printQuoteLib;

(function () {
  /**
   * Main calculation function
   * Calculates complete quote with all costs, margins, and profit
   */
  window.calculateQuote = function () {
    // ===== GET ALL INPUT VALUES =====

    // System Configuration
    const heatPumpCapacity = parseFloat(
      document.getElementById("heatPumpCapacity").value
    );
    const systemType = document.getElementById("systemType").value;
    const bufferTankSize = parseFloat(
      document.getElementById("bufferTankSize").value
    );
    const installationComplexity = document.getElementById(
      "installationComplexity"
    ).value;

    // Piping
    const primaryPiping = parseFloat(
      document.getElementById("primaryPiping").value
    );
    const primaryMaterial = document.getElementById(
      "primaryPipeMaterial"
    ).value;
    const secondaryPiping = parseFloat(
      document.getElementById("secondaryPiping").value
    );
    const secondaryMaterial = document.getElementById(
      "secondaryPipeMaterial"
    ).value;

    const condensateDrain = parseFloat(
      document.getElementById("condensateDrain").value
    );
    const electricalCabling = parseFloat(
      document.getElementById("electricalCabling").value
    );

    // Floor work
    const includeFloorWork =
      document.getElementById("includeFloorWork").checked;
    const floorAreaLifted = parseFloat(
      document.getElementById("floorAreaLifted").value
    );

    // Radiators
    const includeRadiators =
      document.getElementById("includeRadiators").checked;
    const numRadiators = parseFloat(
      document.getElementById("numRadiators").value
    );
    const radiatorType = document.getElementById("radiatorType").value;
    const trvInstall = document.getElementById("trvInstall").value;

    // Hot water
    const includeHotWater = document.getElementById("includeHotWater").checked;
    const cylinderSize = document.getElementById("cylinderSize").value;
    const cylinderType = document.getElementById("cylinderType").value;

    // Controls
    const includeAdvancedControls = document.getElementById(
      "includeAdvancedControls"
    ).checked;
    const controlType = document.getElementById("controlType").value;
    const numZones = parseFloat(document.getElementById("numZones").value);

    // Rates
    const insulationRate = parseFloat(
      document.getElementById("insulationRate").value
    );
    const drainageRate = parseFloat(
      document.getElementById("drainageRate").value
    );
    const electricalRate = parseFloat(
      document.getElementById("electricalRate").value
    );
    const floorLiftRate = parseFloat(
      document.getElementById("floorLiftRate").value
    );
    const radiatorInstallCost = parseFloat(
      document.getElementById("radiatorInstallCost").value
    );
    const trvCost = parseFloat(document.getElementById("trvCost").value);
    const cylinderInstallCost = parseFloat(
      document.getElementById("cylinderInstallCost").value
    );
    const controlInstallCost = parseFloat(
      document.getElementById("controlInstallCost").value
    );

    // Equipment costs
    const heatPumpCost = parseFloat(
      document.getElementById("heatPumpCost").value
    );
    const bufferTankCost = parseFloat(
      document.getElementById("bufferTankCost").value
    );
    const baseLaborCost = parseFloat(
      document.getElementById("baseLaborCost").value
    );

    // ===== CALCULATE MATERIAL COSTS =====
    const primaryPipingCost = primaryPiping * getMaterialRate(primaryMaterial);
    const secondaryPipingCost =
      secondaryPiping * getMaterialRate(secondaryMaterial);
    const totalPiping = primaryPiping + secondaryPiping;
    const insulationCost = totalPiping * insulationRate;
    const drainageCost = condensateDrain * drainageRate;
    const electricalCost = electricalCabling * electricalRate;

    // ===== FLOOR WORK COSTS =====
    const floorWorkCost = includeFloorWork
      ? floorAreaLifted * floorLiftRate
      : 0;

    // ===== RADIATOR COSTS =====
    let radiatorCosts = 0;
    let radiatorInstallCosts = 0;
    let trvCosts = 0;
    if (includeRadiators) {
      radiatorCosts = numRadiators * getRadiatorCost(radiatorType);
      radiatorInstallCosts = numRadiators * radiatorInstallCost;
      if (trvInstall !== "none") {
        const trvPrice = trvInstall === "smart" ? trvCost * 2 : trvCost;
        trvCosts = numRadiators * trvPrice;
      }
    }

    // ===== HOT WATER CYLINDER COSTS =====
    const cylinderCost = includeHotWater
      ? getCylinderCost(cylinderSize, cylinderType)
      : 0;
    const cylinderInstallationCost = includeHotWater ? cylinderInstallCost : 0;

    // ===== CONTROL SYSTEM COSTS =====
    const controlSystemCost = includeAdvancedControls
      ? getControlSystemCost(controlType, numZones)
      : 0;
    const controlSystemInstallCost = includeAdvancedControls
      ? controlInstallCost
      : 0;

    // ===== APPLY COMPLEXITY MULTIPLIERS =====
    let complexityMultiplier = 1.0;
    switch (installationComplexity) {
      case "complex":
        complexityMultiplier = 1.3;
        break;
      case "very_complex":
        complexityMultiplier = 1.6;
        break;
    }

    // ===== APPLY SYSTEM TYPE MULTIPLIERS =====
    let systemMultiplier = 1.0;
    switch (systemType) {
      case "split":
        systemMultiplier = 1.15;
        break;
      case "cascade":
        systemMultiplier = 1.35;
        break;
    }

    // ===== CALCULATE ADJUSTED LABOR COST =====
    const adjustedLaborCost =
      baseLaborCost * complexityMultiplier * systemMultiplier;

    // ===== CALCULATE SUBTOTALS =====
    const equipmentSubtotal =
      heatPumpCost +
      bufferTankCost +
      radiatorCosts +
      cylinderCost +
      controlSystemCost;
    const materialsSubtotal =
      primaryPipingCost + secondaryPipingCost + insulationCost + trvCosts;
    const installationSubtotal =
      drainageCost +
      electricalCost +
      floorWorkCost +
      radiatorInstallCosts +
      cylinderInstallationCost +
      controlSystemInstallCost;
    const laborSubtotal = adjustedLaborCost;

    // ===== CALCULATE TOTAL COSTS =====
    const totalCosts =
      equipmentSubtotal +
      materialsSubtotal +
      installationSubtotal +
      laborSubtotal;

    // ===== CALCULATE OVERHEADS AND CONTINGENCY =====
    const overheadPercentage = parseFloat(
      document.getElementById("overheadPercentage").value
    );
    const riskContingency = parseFloat(
      document.getElementById("riskContingency").value
    );
    const overheadCost = totalCosts * (overheadPercentage / 100);
    const contingencyCost = totalCosts * (riskContingency / 100);
    const adjustedCosts = totalCosts + overheadCost + contingencyCost;

    // ===== CALCULATE PROFIT AND SELLING PRICE =====
    const marginType = document.getElementById("marginType").value;
    const marginValue = parseFloat(
      document.getElementById("marginValue").value
    );
    const useComponentMargins = document.getElementById(
      "useComponentMargins"
    ).checked;

    let profitAmount = 0;
    let sellingPriceBeforeVAT = 0;

    if (useComponentMargins) {
      // Component-specific margins
      const equipmentMargin = parseFloat(
        document.getElementById("equipmentMargin").value
      );
      const materialsMargin = parseFloat(
        document.getElementById("materialsMargin").value
      );
      const laborMargin = parseFloat(
        document.getElementById("laborMargin").value
      );
      const installationMargin = parseFloat(
        document.getElementById("installationMargin").value
      );

      const equipmentProfit = equipmentSubtotal * (equipmentMargin / 100);
      const materialsProfit = materialsSubtotal * (materialsMargin / 100);
      const laborProfit = laborSubtotal * (laborMargin / 100);
      const installationProfit =
        installationSubtotal * (installationMargin / 100);

      profitAmount =
        equipmentProfit + materialsProfit + laborProfit + installationProfit;
      sellingPriceBeforeVAT = adjustedCosts + profitAmount;
    } else {
      // Single margin calculation
      if (marginType === "markup") {
        // Markup: Add X% to costs
        profitAmount = adjustedCosts * (marginValue / 100);
        sellingPriceBeforeVAT = adjustedCosts + profitAmount;
      } else if (marginType === "margin") {
        // Margin: Profit is X% of selling price
        sellingPriceBeforeVAT = adjustedCosts / (1 - marginValue / 100);
        profitAmount = sellingPriceBeforeVAT - adjustedCosts;
      } else {
        // fixed
        // Fixed profit amount
        profitAmount = marginValue;
        sellingPriceBeforeVAT = adjustedCosts + profitAmount;
      }
    }

    // ===== CHECK TARGET SELLING PRICE =====
    const targetSellPrice = parseFloat(
      document.getElementById("targetSellPrice").value
    );
    if (targetSellPrice > 0) {
      sellingPriceBeforeVAT = targetSellPrice;
      profitAmount = sellingPriceBeforeVAT - adjustedCosts;
    }

    // ===== CALCULATE VAT AND FINAL PRICE =====
    const vat = sellingPriceBeforeVAT * 0.2; // 20% VAT
    const finalSellingPrice = sellingPriceBeforeVAT + vat;

    // ===== CALCULATE MARGIN PERCENTAGES FOR ANALYSIS =====
    const actualMarginPercentage = (profitAmount / sellingPriceBeforeVAT) * 100;
    const markupPercentage = (profitAmount / adjustedCosts) * 100;

    // ===== COMPETITOR ANALYSIS =====
    const competitorPrice = parseFloat(
      document.getElementById("competitorPrice").value
    );
    const competitorDifference =
      competitorPrice > 0 ? finalSellingPrice - competitorPrice : 0;
    const competitorPercentDiff =
      competitorPrice > 0
        ? ((finalSellingPrice - competitorPrice) / competitorPrice) * 100
        : 0;

    // ===== BUILD RESULTS HTML =====
    let resultsHTML = `
                <div class="category-header">Equipment & Components</div>
                <div class="result-item">
                    <span class="result-label">Heat Pump Unit (${heatPumpCapacity}kW)</span>
                    <span class="result-value">£${heatPumpCost.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Buffer Tank (${bufferTankSize}L)</span>
                    <span class="result-value">£${bufferTankCost.toLocaleString()}</span>
                </div>`;

    if (includeRadiators) {
      resultsHTML += `
                <div class="result-item">
                    <span class="result-label">Radiators <span class="unit-suffix">(${numRadiators} x ${radiatorType})</span></span>
                    <span class="result-value">£${radiatorCosts.toLocaleString()}</span>
                </div>`;
    }

    if (includeHotWater) {
      resultsHTML += `
                <div class="result-item">
                    <span class="result-label">Hot Water Cylinder <span class="unit-suffix">(${cylinderSize} ${cylinderType})</span></span>
                    <span class="result-value">£${cylinderCost.toLocaleString()}</span>
                </div>`;
    }

    resultsHTML += `
                <div class="result-item">
                    <span class="result-label">Control System <span class="unit-suffix">(${controlType}, ${numZones} zones)</span></span>
                    <span class="result-value">£${controlSystemCost.toLocaleString()}</span>
                </div>

                <div class="category-header">Materials</div>
                <div class="result-item">
                    <span class="result-label">Primary Piping <span class="unit-suffix">(${primaryPiping}m ${primaryMaterial})</span></span>
                    <span class="result-value">£${primaryPipingCost.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Secondary Piping <span class="unit-suffix">(${secondaryPiping}m ${secondaryMaterial})</span></span>
                    <span class="result-value">£${secondaryPipingCost.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Pipe Insulation <span class="unit-suffix">(${totalPiping}m @ £${insulationRate}/m)</span></span>
                    <span class="result-value">£${insulationCost.toLocaleString()}</span>
                </div>`;

    if (trvCosts > 0) {
      resultsHTML += `
                <div class="result-item">
                    <span class="result-label">Thermostatic Valves <span class="unit-suffix">(${numRadiators} x ${trvInstall})</span></span>
                    <span class="result-value">£${trvCosts.toLocaleString()}</span>
                </div>`;
    }

    resultsHTML += `
                <div class="category-header">Installation & Labor</div>
                <div class="result-item">
                    <span class="result-label">Drainage Work <span class="unit-suffix">(${condensateDrain}m @ £${drainageRate}/m)</span></span>
                    <span class="result-value">£${drainageCost.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Electrical Work <span class="unit-suffix">(${electricalCabling}m @ £${electricalRate}/m)</span></span>
                    <span class="result-value">£${electricalCost.toLocaleString()}</span>
                </div>`;

    if (includeFloorWork && floorWorkCost > 0) {
      resultsHTML += `
                <div class="result-item">
                    <span class="result-label">Floor Lifting/Replacement <span class="unit-suffix">(${floorAreaLifted}m² @ £${floorLiftRate}/m²)</span></span>
                    <span class="result-value">£${floorWorkCost.toLocaleString()}</span>
                </div>`;
    }

    if (includeRadiators && radiatorInstallCosts > 0) {
      resultsHTML += `
                <div class="result-item">
                    <span class="result-label">Radiator Installation <span class="unit-suffix">(${numRadiators} @ £${radiatorInstallCost} each)</span></span>
                    <span class="result-value">£${radiatorInstallCosts.toLocaleString()}</span>
                </div>`;
    }

    if (includeHotWater && cylinderInstallationCost > 0) {
      resultsHTML += `
                <div class="result-item">
                    <span class="result-label">Cylinder Installation</span>
                    <span class="result-value">£${cylinderInstallationCost.toLocaleString()}</span>
                </div>`;
    }

    resultsHTML += `
                <div class="result-item">
                    <span class="result-label">Control System Installation</span>
                    <span class="result-value">£${controlSystemInstallCost.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Base Labor Cost <span class="unit-suffix">(${installationComplexity}, ${systemType})</span></span>
                    <span class="result-value">£${adjustedLaborCost.toLocaleString()}</span>
                </div>

                <div class="category-header">Cost Analysis</div>
                <div class="result-item">
                    <span class="result-label">Equipment Subtotal</span>
                    <span class="result-value">£${equipmentSubtotal.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Materials Subtotal</span>
                    <span class="result-value">£${materialsSubtotal.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Installation Subtotal</span>
                    <span class="result-value">£${installationSubtotal.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Labor Subtotal</span>
                    <span class="result-value">£${laborSubtotal.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Direct Costs Total</span>
                    <span class="result-value">£${totalCosts.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Overheads <span class="unit-suffix">(${overheadPercentage}%)</span></span>
                    <span class="result-value">£${overheadCost.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Risk Contingency <span class="unit-suffix">(${riskContingency}%)</span></span>
                    <span class="result-value">£${contingencyCost.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Project Costs</span>
                    <span class="result-value">£${adjustedCosts.toLocaleString()}</span>
                </div>

                <div class="category-header">Profit Analysis</div>
                <div class="result-item">
                    <span class="result-label">Profit Amount</span>
                    <span class="result-value">£${profitAmount.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Selling Price (Ex VAT)</span>
                    <span class="result-value">£${sellingPriceBeforeVAT.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">VAT (20%)</span>
                    <span class="result-value">£${vat.toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Gross Margin</span>
                    <span class="result-value">${actualMarginPercentage.toFixed(
                      1
                    )}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Markup on Costs</span>
                    <span class="result-value">${markupPercentage.toFixed(
                      1
                    )}%</span>
                </div>`;

    if (competitorPrice > 0) {
      const comparisonColor = competitorDifference > 0 ? "#e74c3c" : "#27ae60";
      const comparisonSymbol = competitorDifference > 0 ? "+" : "";
      resultsHTML += `
                <div class="category-header">Competitive Analysis</div>
                <div class="result-item">
                    <span class="result-label">Your Price vs Competitor</span>
                    <span class="result-value" style="color: ${comparisonColor};">${comparisonSymbol}£${Math.abs(
        competitorDifference
      ).toLocaleString()} (${
        competitorPercentDiff > 0 ? "+" : ""
      }${competitorPercentDiff.toFixed(1)}%)</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Competitor Price</span>
                    <span class="result-value">£${competitorPrice.toLocaleString()}</span>
                </div>`;
    }

    resultsHTML += `
                <div class="result-item">
                    <span class="result-label">FINAL QUOTE PRICE</span>
                    <span class="result-value">£${finalSellingPrice.toLocaleString()}</span>
                </div>
            `;

    // ===== DISPLAY RESULTS =====
    document.getElementById("results").innerHTML = resultsHTML;
    document.getElementById("resultsSection").style.display = "block";

    // Ensure subsection totals reflect the same computed values
    try {
      updateSubsectionTotals();
    } catch (e) {
      /* ignore if not available */
    }

    // Smooth scroll to results
    document.getElementById("resultsSection").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /**
   * Calculate and display subsection totals
   */
  window.updateSubsectionTotals = function () {
    try {
      //Equipment Total
      const heatPumpCost =
        parseFloat(document.getElementById("heatPumpCost").value) || 0;
      const bufferTankCost =
        parseFloat(document.getElementById("bufferTankCost").value) || 0;
      const baseLaborCost =
        parseFloat(document.getElementById("baseLaborCost").value) || 0;

      const installationComplexity = document.getElementById(
        "installationComplexity"
      ).value;
      const systemType = document.getElementById("systemType").value;
      const complexityMultiplier = getComplexityMultiplier(
        installationComplexity
      );
      const systemMultiplier = getSystemMultiplier(systemType);
      const equipmentTotal =
        heatPumpCost +
        bufferTankCost +
        systemMultiplier * complexityMultiplier * baseLaborCost;
      document.getElementById(
        "equipmentTotal"
      ).textContent = `£${heatPumpCost.toLocaleString()}+£${bufferTankCost.toLocaleString()}+${complexityMultiplier} x ${systemMultiplier} x £${baseLaborCost.toLocaleString()}=£${equipmentTotal.toLocaleString()}`;
      // Primary Circuit Total
      const primaryMaterial = document.getElementById(
        "primaryPipeMaterial"
      ).value;
      const primaryPiping =
        parseFloat(document.getElementById("primaryPiping").value) || 0;
      const insulationRate =
        parseFloat(document.getElementById("insulationRate").value) || 0;
      const primaryMaterialRate = getMaterialRate(primaryMaterial);
      const primaryPipingCost = primaryPiping * primaryMaterialRate;
      const primaryInsulationCost = primaryPiping * insulationRate;
      const primaryCircuitTotal = primaryPipingCost; // + primaryInsulationCost;
      document.getElementById(
        "primaryCircuitTotal"
      ).textContent = `${primaryPiping}x£${primaryMaterialRate} = £${primaryCircuitTotal.toLocaleString()}`;

      console.log("primaryCircuitTotal", primaryCircuitTotal);
      // Secondary Circuit Total
      const secondaryMaterial = document.getElementById(
        "secondaryPipeMaterial"
      ).value;
      const secondaryPiping =
        parseFloat(document.getElementById("secondaryPiping").value) || 0;
      const secondaryMaterialRate = getMaterialRate(secondaryMaterial);
      const secondaryPipingCost = secondaryPiping * secondaryMaterialRate;
      const secondaryInsulationCost = secondaryPiping * insulationRate;
      const secondaryCircuitTotal = secondaryPipingCost; //+ secondaryInsulationCost;
      document.getElementById(
        "secondaryCircuitTotal"
      ).textContent = `${secondaryPiping} x £${secondaryMaterialRate} = £${secondaryCircuitTotal.toLocaleString()}`;
      console.log("secondaryCircuitTotal", secondaryCircuitTotal);
      // Drainage Work Total
      const condensateDrain =
        parseFloat(document.getElementById("condensateDrain").value) || 0;
      const drainageRate = getCondensateDrainCost();
      // parseFloat(document.getElementById("drainageRate").value) || 0;
      const drainageTotal = condensateDrain * drainageRate;
      document.getElementById(
        "drainageTotal"
      ).textContent = `${condensateDrain}x £${drainageRate} =  £${drainageTotal.toLocaleString()}`;

      // Electrical Work Total
      const electricalCabling =
        parseFloat(document.getElementById("electricalCabling").value) || 0;
      const electricalRate = getElectricalCablesCost();
      //parseFloat(document.getElementById("electricalRate").value) || 0;
      const electricalTotal = electricalCabling * electricalRate;
      document.getElementById(
        "electricalTotal"
      ).textContent = `${electricalCabling} x £${electricalRate} = £${electricalTotal.toLocaleString()}`;

      // Floor Work Total
      const includeFloorWork =
        document.getElementById("includeFloorWork").checked;
      const floorAreaLifted =
        parseFloat(document.getElementById("floorAreaLifted").value) || 0;
      const floorLiftRate =
        parseFloat(document.getElementById("floorLiftRate").value) || 0;
      const floorWorkTotal = includeFloorWork
        ? floorAreaLifted * floorLiftRate
        : 0;
      document.getElementById("floorWorkTotal").textContent = includeFloorWork
        ? `${floorAreaLifted.toLocaleString()} x £${floorLiftRate.toLocaleString()} = £${floorWorkTotal.toLocaleString()}`
        : `£0`;

      // Radiator System Total
      const includeRadiators =
        document.getElementById("includeRadiators").checked;
      let radiatorTotal = 0;
      let radiatorUnitCost = 0;
      let trvCosts = 0;
      if (includeRadiators) {
        const numRadiators =
          parseFloat(document.getElementById("numRadiators").value) || 0;
        const radiatorType = document.getElementById("radiatorType").value;
        const trvInstall = document.getElementById("trvInstall").value;
        const radiatorInstallCost =
          parseFloat(document.getElementById("radiatorInstallCost").value) || 0;
        const trvCost =
          parseFloat(document.getElementById("trvCost").value) || 0;

        const radiatorUnitCost = getRadiatorCost(radiatorType);
        const radiatorCosts = numRadiators * radiatorUnitCost;
        const radiatorInstallCosts = numRadiators * radiatorInstallCost;
        const trvCosts =
          trvInstall !== "none"
            ? numRadiators * (trvInstall === "smart" ? trvCost * 2 : trvCost)
            : 0;

        radiatorTotal = radiatorCosts + radiatorInstallCosts + trvCosts;

        document.getElementById(
          "radiatorTotal"
        ).textContent = `${numRadiators} x (£${radiatorUnitCost} + £${radiatorInstallCost} + £${trvCost}) = £${radiatorTotal.toLocaleString()}`;
      } else {
        document.getElementById("radiatorTotal").textContent = `£0`;
      }
      // Hot Water System & Controls Total
      const includeHotWater =
        document.getElementById("includeHotWater").checked;
      const includeAdvancedControls = document.getElementById(
        "includeAdvancedControls"
      ).checked;
      let hotWaterTotal = 0;

      // Calculate hot water costs
      if (includeHotWater) {
        const cylinderSize = document.getElementById("cylinderSize").value;
        const cylinderType = document.getElementById("cylinderType").value;
        const cylinderInstallCost =
          parseFloat(document.getElementById("cylinderInstallCost").value) || 0;
        const cylinderCost = getCylinderCost(cylinderSize, cylinderType);
        hotWaterTotal = cylinderCost + cylinderInstallCost;
      }

      // Add control system costs
      const controlType = document.getElementById("controlType").value;
      const numZones =
        parseFloat(document.getElementById("numZones").value) || 0;
      const controlInstallCost =
        parseFloat(document.getElementById("controlInstallCost").value) || 0;

      const controlSystemCost = includeAdvancedControls
        ? getControlSystemCost(controlType, numZones)
        : 0; // 200; // 200 is base cost for basic controls
      const controlSystemInstallCost = includeAdvancedControls
        ? controlInstallCost
        : 0; // 100; // 100 is base installation cost

      // Add control costs to total
      hotWaterTotal += controlSystemCost + controlSystemInstallCost;

      document.getElementById(
        "hotWaterTotal"
      ).textContent = `£${hotWaterTotal.toLocaleString()}`;
      console.log("hotWaterTotal", hotWaterTotal);
    } catch (error) {
      console.error("Error in updateSubsectionTotals:", error);
    }
  };

  /**
   * Update margin help text based on selected margin type
   */
  window.updateMarginHelp = function () {
    const marginType = document.getElementById("marginType").value;
    const marginValue = document.getElementById("marginValue").value;
    const helpText = document.getElementById("marginHelp");

    switch (marginType) {
      case "markup":
        helpText.textContent = `${marginValue}% markup on total costs`;
        break;
      case "margin":
        helpText.textContent = `${marginValue}% gross profit margin`;
        break;
      case "fixed":
        helpText.textContent = `Fixed £${marginValue} profit amount`;
        break;
    }
  };

  /**
   * Toggle field enable/disable based on checkbox states
   */
  function toggleFieldsets() {
    // Floor work fields
    const floorWorkCheckbox = document.getElementById("includeFloorWork");
    const floorFields = ["floorAreaLifted", "floorType"];
    floorFields.forEach((fieldId) => {
      document.getElementById(fieldId).disabled = !floorWorkCheckbox.checked;
    });

    // Radiator fields
    const radiatorCheckbox = document.getElementById("includeRadiators");
    const radiatorFields = ["numRadiators", "radiatorType", "trvInstall"];
    radiatorFields.forEach((fieldId) => {
      document.getElementById(fieldId).disabled = !radiatorCheckbox.checked;
    });

    // Hot water fields
    const hotWaterCheckbox = document.getElementById("includeHotWater");
    const hotWaterFields = ["cylinderSize", "cylinderType"];
    hotWaterFields.forEach((fieldId) => {
      document.getElementById(fieldId).disabled = !hotWaterCheckbox.checked;
    });

    // Advanced controls fields
    const advancedControlsCheckbox = document.getElementById(
      "includeAdvancedControls"
    );
    const controlFields = ["controlType", "numZones"];
    controlFields.forEach((fieldId) => {
      document.getElementById(fieldId).disabled =
        !advancedControlsCheckbox.checked;
    });

    // Component margins fields
    const componentMarginsCheckbox = document.getElementById(
      "useComponentMargins"
    );
    const componentMarginFields = [
      "equipmentMargin",
      "materialsMargin",
      "laborMargin",
      "installationMargin",
    ];
    const componentMarginsDiv = document.getElementById("componentMargins");

    if (componentMarginsCheckbox.checked) {
      componentMarginsDiv.style.opacity = "1";
      componentMarginFields.forEach((fieldId) => {
        document.getElementById(fieldId).disabled = false;
      });
    } else {
      componentMarginsDiv.style.opacity = "0.5";
      componentMarginFields.forEach((fieldId) => {
        document.getElementById(fieldId).disabled = true;
      });
    }
  }

  /**
   * Initialize application on page load
   */
  document.addEventListener("DOMContentLoaded", function () {
    // Get checkbox elements
    const floorWorkCheckbox = document.getElementById("includeFloorWork");
    const radiatorCheckbox = document.getElementById("includeRadiators");
    const hotWaterCheckbox = document.getElementById("includeHotWater");
    const advancedControlsCheckbox = document.getElementById(
      "includeAdvancedControls"
    );
    const componentMarginsCheckbox = document.getElementById(
      "useComponentMargins"
    );
    const marginTypeSelect = document.getElementById("marginType");

    // Add event listeners
    floorWorkCheckbox.addEventListener("change", toggleFieldsets);
    radiatorCheckbox.addEventListener("change", toggleFieldsets);
    hotWaterCheckbox.addEventListener("change", toggleFieldsets);
    advancedControlsCheckbox.addEventListener("change", toggleFieldsets);
    componentMarginsCheckbox.addEventListener("change", toggleFieldsets);
    marginTypeSelect.addEventListener("change", updateMarginHelp);
    document
      .getElementById("marginValue")
      .addEventListener("input", updateMarginHelp);

    // Add input event listeners for real-time updates
    const inputs = document.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("input", updateSubsectionTotals);
      input.addEventListener("change", updateSubsectionTotals);
    });

    // Initial setup
    toggleFieldsets();
    updateMarginHelp();
    calculateQuote();
  });

  window.toggleFieldsets = toggleFieldsets;

  // function calculateSubtotals() {
  //   // Primary Circuit
  //   const primaryPiping =
  //     parseFloat(document.getElementById("primaryPiping").value) || 0;
  //   const primaryMaterial = document.getElementById(
  //     "primaryPipeMaterial"
  //   ).value;
  //   const insulationRate =
  //     parseFloat(document.getElementById("insulationRate").value) || 0;
  //   const primaryMaterialRate = getMaterialRate(primaryMaterial);

  //   const primaryTotal =
  //     primaryPiping * primaryMaterialRate + primaryPiping * insulationRate;
  //   document.getElementById(
  //     "primaryCircuitTotal"
  //   ).textContent = `£${primaryTotal.toLocaleString()}`;

  //   // Secondary Circuit
  //   const secondaryPiping =
  //     parseFloat(document.getElementById("secondaryPiping").value) || 0;
  //   const secondaryMaterial = document.getElementById(
  //     "secondaryPipeMaterial"
  //   ).value;
  //   const secondaryMaterialRate = getMaterialRate(secondaryMaterial);

  //   const secondaryTotal =
  //     secondaryPiping * secondaryMaterialRate +
  //     secondaryPiping * insulationRate;
  //   document.getElementById(
  //     "secondaryCircuitTotal"
  //   ).textContent = `£${secondaryTotal.toLocaleString()}`;

  //   // Drainage Work Total
  //   const condensateDrain =
  //     parseFloat(document.getElementById("condensateDrain").value) || 0;
  //   const drainageRate =
  //     parseFloat(document.getElementById("drainageRate").value) || 0;
  //   const drainageTotal = condensateDrain * drainageRate;
  //   document.getElementById(
  //     "drainageTotal"
  //   ).textContent = `£${drainageTotal.toLocaleString()}`;

  //   // Electrical Work Total
  //   const electricalCabling =
  //     parseFloat(document.getElementById("electricalCabling").value) || 0;
  //   const electricalRate =
  //     parseFloat(document.getElementById("electricalRate").value) || 0;
  //   const electricalTotal = electricalCabling * electricalRate;
  //   document.getElementById(
  //     "electricalTotal"
  //   ).textContent = `£${electricalTotal.toLocaleString()}`;

  //   // Floor Work Total
  //   const includeFloorWork =
  //     document.getElementById("includeFloorWork").checked;
  //   const floorAreaLifted =
  //     parseFloat(document.getElementById("floorAreaLifted").value) || 0;
  //   const floorLiftRate =
  //     parseFloat(document.getElementById("floorLiftRate").value) || 0;
  //   const floorWorkTotal = includeFloorWork
  //     ? floorAreaLifted * floorLiftRate
  //     : 0;
  //   document.getElementById(
  //     "floorWorkTotal"
  //   ).textContent = `£${floorWorkTotal.toLocaleString()}`;

  //   // Radiator System Total
  //   const includeRadiators =
  //     document.getElementById("includeRadiators").checked;
  //   let radiatorTotal = 0;
  //   if (includeRadiators) {
  //     const numRadiators =
  //       parseFloat(document.getElementById("numRadiators").value) || 0;
  //     const radiatorType = document.getElementById("radiatorType").value;
  //     const trvInstall = document.getElementById("trvInstall").value;
  //     const radiatorInstallCost =
  //       parseFloat(document.getElementById("radiatorInstallCost").value) || 0;
  //     const trvCost = parseFloat(document.getElementById("trvCost").value) || 0;

  //     const radiatorUnitCost = getRadiatorCost(radiatorType);
  //     const radiatorCosts = numRadiators * radiatorUnitCost;
  //     const radiatorInstallCosts = numRadiators * radiatorInstallCost;
  //     const trvCosts =
  //       trvInstall !== "none"
  //         ? numRadiators * (trvInstall === "smart" ? trvCost * 2 : trvCost)
  //         : 0;

  //     radiatorTotal = radiatorCosts + radiatorInstallCosts + trvCosts;
  //   }
  //   document.getElementById(
  //     "radiatorTotal"
  //   ).textContent = `£${radiatorTotal.toLocaleString()}`;

  //   // Hot Water System & Controls Total
  //   const includeHotWater = document.getElementById("includeHotWater").checked;
  //   const includeAdvancedControls = document.getElementById(
  //     "includeAdvancedControls"
  //   ).checked;
  //   let hotWaterTotal = 0;

  //   // Calculate hot water costs
  //   if (includeHotWater) {
  //     const cylinderSize = document.getElementById("cylinderSize").value;
  //     const cylinderType = document.getElementById("cylinderType").value;
  //     const cylinderInstallCost =
  //       parseFloat(document.getElementById("cylinderInstallCost").value) || 0;
  //     const cylinderCost = getCylinderCost(cylinderSize, cylinderType);
  //     hotWaterTotal = cylinderCost + cylinderInstallCost;
  //   }

  //   // Add control system costs
  //   const controlType = document.getElementById("controlType").value;
  //   const numZones = parseFloat(document.getElementById("numZones").value) || 0;
  //   const controlInstallCost =
  //     parseFloat(document.getElementById("controlInstallCost").value) || 0;

  //   const controlSystemCost = includeAdvancedControls
  //     ? getControlSystemCost(controlType, numZones)
  //     : 200; // 200 is base cost for basic controls
  //   const controlSystemInstallCost = includeAdvancedControls
  //     ? controlInstallCost
  //     : 100; // 100 is base installation cost

  //   // Add control costs to total
  //   hotWaterTotal += controlSystemCost + controlSystemInstallCost;

  //   document.getElementById(
  //     "hotWaterTotal"
  //   ).textContent = `£${hotWaterTotal.toLocaleString()}`;
  // }

  // window.calculateSubtotals = calculateSubtotals;
})();
