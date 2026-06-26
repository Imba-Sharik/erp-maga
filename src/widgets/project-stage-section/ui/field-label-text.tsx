interface FieldLabelTextProps {
  label: string
  required?: boolean
}

export function FieldLabelText({ label, required }: FieldLabelTextProps) {
  return (
    <>
      {label}
      {required ? <span className="text-error">*</span> : null}
    </>
  )
}
