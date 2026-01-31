# Design System Rules - GoHire Copilot

## Direcao de Marca
- Sensacao: **confianca, calma, clareza, premium**
- Nao pode: neon/cyberpunk/gamer/corporativo frio

## Paleta "Warm Intelligence"

```css
/* Cores principais */
--navy: #0F1F2E;      /* Estrutura, texto */
--sand: #F5F3EE;      /* Background */
--stone: #C8C1B8;     /* Borders, secundario */
--amber: #F4B860;     /* CTA primario, "decisao" */
--teal: #4FA3A5;      /* Links, estados ativos */
```

### Uso das Cores

| Cor | Uso |
|-----|-----|
| Navy | Texto principal, headers, estrutura |
| Sand | Background de paginas |
| Stone | Borders, textos secundarios, dividers |
| Amber | CTA primario, badges importantes, highlights |
| Teal | Links, botoes secundarios, estados ativos |

## Componentes

### Botoes
```tsx
<Button>Primario (amber)</Button>
<Button variant="secondary">Secundario (outline)</Button>
<Button variant="ghost">Ghost (texto)</Button>
```

**Regra**: Apenas 1 CTA primario (amber) por secao.

### Cards
- Fundo claro (`bg-white` ou `bg-sand`)
- Sombra suave (`shadow-sm` ou `shadow-md`)
- Bordas discretas (`border border-stone/30`)
- Variant `elevated` para destaque

### Badges
```tsx
<Badge>Default</Badge>
<Badge className="bg-teal/20 text-teal">Ativo</Badge>
<Badge className="bg-amber/20 text-amber">Destaque</Badge>
```

## Spacing

Use espacamento consistente:
- `gap-2` (8px) - entre elementos inline
- `gap-4` (16px) - entre elementos relacionados
- `gap-6` (24px) - entre secoes
- `gap-8` (32px) - entre blocos

## Typography

- Titulos: `font-semibold` ou `font-bold`
- Corpo: `font-normal`
- Secundario: `text-navy/70` ou `text-navy/60`
- Pequeno: `text-sm` ou `text-xs`

## Responsividade

Breakpoints Tailwind:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+

Padrao mobile-first:
```tsx
<div className="flex flex-col sm:flex-row">
```
