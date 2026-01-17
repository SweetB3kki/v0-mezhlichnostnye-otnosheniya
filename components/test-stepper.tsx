import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: string
  label: string
}

interface TestStepperProps {
  steps: Step[]
  currentStep: number
}

export function TestStepper({ steps, currentStep }: TestStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                index < currentStep
                  ? "bg-[var(--cloud-purple)] text-[var(--ink)]"
                  : index === currentStep
                    ? "gradient-btn text-[var(--ink)]"
                    : "bg-[var(--cloud-bg)] text-[var(--ink-secondary)] border border-[var(--border)]",
              )}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span
              className={cn(
                "text-sm font-medium hidden sm:inline",
                index === currentStep ? "text-[var(--ink)]" : "text-[var(--ink-secondary)]",
              )}
            >
              {step.label}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={cn("w-12 h-0.5 mx-2", index < currentStep ? "bg-[var(--cloud-purple)]" : "bg-[var(--border)]")}
            />
          )}
        </div>
      ))}
    </div>
  )
}
