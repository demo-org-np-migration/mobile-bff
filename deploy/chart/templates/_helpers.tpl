{{- define "mobile-bff.name" -}}
mobile-bff
{{- end -}}

{{- define "mobile-bff.labels" -}}
app.kubernetes.io/name: {{ include "mobile-bff.name" . }}
app.kubernetes.io/part-of: cauri
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
cauri.io/team: channels
{{- end -}}

{{- define "mobile-bff.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mobile-bff.name" . }}
{{- end -}}
