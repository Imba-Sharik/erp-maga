interface RequiredLabelProps {
  label: string
  required?: boolean
}

export function RequiredLabel({ label, required }: RequiredLabelProps) {
  // Оборачиваем в один span: FormLabel/Label — это flex с gap-2,
  // иначе текст и «*» разносило бы лишним отступом.
  return (
    <span>
      {label}
      {required ? <span className="text-[#D25252]"> *</span> : null}
    </span>
  )
}
