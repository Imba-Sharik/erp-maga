interface RequiredLabelProps {
  label: string
  required?: boolean
}

export function RequiredLabel({ label, required }: RequiredLabelProps) {
  return (
    <>
      {label}
      {required ? <span className="text-[#D25252]">*</span> : null}
    </>
  )
}
