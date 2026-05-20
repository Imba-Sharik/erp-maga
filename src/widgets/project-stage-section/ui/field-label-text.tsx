interface FieldLabelTextProps {
  label: string
  required?: boolean
}

export function FieldLabelText({ label, required }: FieldLabelTextProps) {
  return (
    <>
      {label}
      {required ? <span className="text-[#D25252]">*</span> : null}
    </>
  )
}
