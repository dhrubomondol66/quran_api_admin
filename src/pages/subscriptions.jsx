// pages/subscriptions.jsx
import React, { useState, useEffect } from "react";
import { CreditCard, Edit2, Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { getSubscriptionPlans, saveSubscriptionPlan } from "../services/overview";

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSubscriptionPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load subscription plans:", err);
      setError("Failed to fetch subscription plans from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setEditPrice(plan.price || "");
    setError("");
    setSuccess("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price amount.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        interval: selectedPlan.interval,
        price: parsedPrice,
        is_active: selectedPlan.is_active !== undefined ? selectedPlan.is_active : true
      };

      await saveSubscriptionPlan(payload);
      setSuccess(`Successfully updated the ${selectedPlan.interval} pricing. Synced with Stripe.`);
      setSelectedPlan(null);
      fetchPlans();
    } catch (err) {
      console.error("Failed to save plan:", err);
      setError(err.message || "Failed to update pricing plan and sync with Stripe.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-7 bg-[#f4f6f4] dark:bg-[#070b09] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-semibold text-black dark:text-white font-serif">SUBSCRIPTIONS</h1>
          <p className="text-[13px] text-[#5a6b5e] dark:text-[#8ea094] mt-0.5">Manage premium subscription plans and Stripe pricing configurations</p>
        </div>
        <button
          onClick={fetchPlans}
          className="p-2.5 rounded-lg border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors cursor-pointer"
          title="Refresh Plans"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-[13px]">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3 text-emerald-700 dark:text-emerald-400 text-[13px]">
          <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={32} className="animate-spin text-[#2d5a3d] dark:text-[#4ade80]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {plans.map((plan) => (
            <div
              key={plan.id || plan.interval}
              className="bg-white dark:bg-[#0d1611] rounded-2xl border border-[#e8eae8] dark:border-[#1c3225] p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Decorative top stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2d5a3d]" />

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[11px] font-semibold tracking-wider text-[#888b88] dark:text-[#5a6b5e] uppercase">
                      {plan.name || "PREMIUM PLAN"}
                    </span>
                    <h3 className="text-xl font-bold text-[#1a2a1e] dark:text-white capitalize mt-1">
                      {plan.interval} Billing
                    </h3>
                  </div>
                  <div className="p-2 bg-[#f0f4f1] dark:bg-[#16271f] rounded-lg text-[#2d5a3d] dark:text-[#4ade80]">
                    <CreditCard size={20} />
                  </div>
                </div>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-[#1a2a1e] dark:text-white font-serif">
                    ${plan.price !== undefined ? parseFloat(plan.price).toFixed(2) : "0.00"}
                  </span>
                  <span className="text-[13px] text-[#5a6b5e] dark:text-[#8ea094] font-medium ml-1">
                    / {plan.interval === "monthly" ? "month" : "year"}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-[12px] text-[#5a6b5e] dark:text-[#8ea094]">
                    <Shield size={14} className="text-[#c9a84c]" />
                    <span>Synchronized with Stripe Gateway</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-[#5a6b5e] dark:text-[#8ea094]">
                    <Shield size={14} className="text-[#c9a84c]" />
                    <span>Automatic recurring billing</span>
                  </div>
                  {plan.stripe_price_id && (
                    <div className="mt-4 pt-4 border-t border-[#f0f4f1] dark:border-[#1c3225]">
                      <span className="text-[10px] block font-mono text-[#888b88] dark:text-[#5a6b5e]">
                        Stripe Price ID: {plan.stripe_price_id}
                      </span>
                      {plan.stripe_product_id && (
                        <span className="text-[10px] block font-mono text-[#888b88] dark:text-[#5a6b5e] mt-0.5">
                          Stripe Product ID: {plan.stripe_product_id}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleEditClick(plan)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#2d5a3d] dark:border-[#4ade80] text-[#2d5a3d] dark:text-[#4ade80] font-semibold text-[13px] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors cursor-pointer bg-transparent"
              >
                <Edit2 size={14} />
                Edit Plan & Sync
              </button>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-2 bg-[#f8faf8] dark:bg-[#0d1611]/40 border border-dashed border-[#e8eae8] dark:border-[#1c3225] rounded-2xl p-12 text-center text-[#5a6b5e] dark:text-[#8ea094]">
              <CreditCard size={40} className="mx-auto text-[#888b88] dark:text-[#5a6b5e] mb-3" />
              <p className="text-[14px]">No active subscription plans found in the system.</p>
              <p className="text-[12px] text-[#888b88] dark:text-[#5a6b5e] mt-1">Pricing tiers are fetched dynamically from Stripe.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0d1611] rounded-2xl border border-[#e8eae8] dark:border-[#1c3225] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-[#f0f4f1] dark:border-[#1c3225] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1a2a1e] dark:text-white font-serif">
                Edit {selectedPlan.interval === "monthly" ? "Monthly" : "Yearly"} Price
              </h3>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-[#888b88] dark:text-[#5a6b5e] hover:text-[#1a2a1e] dark:hover:text-white text-[18px] cursor-pointer bg-transparent border-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                <div className="bg-[#fcfdfc] dark:bg-[#121f17] border border-[#e8eae8] dark:border-[#1c3225] rounded-xl p-4 text-[12px] text-[#5a6b5e] dark:text-[#8ea094] flex gap-3">
                  <AlertTriangle size={18} className="text-[#c9a84c] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[#1a2a1e] dark:text-white mb-0.5">Stripe Synchronization Notice</span>
                    Updating this price will configure a new pricing plan on Stripe and archive the previous rate. Active subscriptions will continue at their old rate, while new subscribers will purchase at the updated price.
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#1a2a1e] dark:text-white uppercase tracking-wider mb-1.5">
                    Plan Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a6b5e] dark:text-[#8ea094] font-semibold text-[14px]">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-12 py-[11px] border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] text-[14px] text-[#1a2a1e] dark:text-white bg-white dark:bg-[#132219] outline-none focus:border-[#2d5a3d] dark:focus:border-[#4ade80] transition-colors"
                      placeholder="0.00"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#888b88] dark:text-[#5a6b5e] font-medium capitalize">
                      / {selectedPlan.interval === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#f8faf8] dark:bg-[#121f17] border-t border-[#f0f4f1] dark:border-[#1c3225] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#132219] text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] text-[13px] font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-[#2d5a3d] dark:bg-[#4ade80] text-white dark:text-[#0d1611] hover:bg-[#1a3a2a] dark:hover:bg-[#34bd65] text-[13px] font-semibold cursor-pointer transition-colors flex items-center gap-2 border-none"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    "Save & Sync"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
