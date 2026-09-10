---
name: shadcn-ui
description: shadcn/ui component patterns, theming, customization, and composition for Next.js/React apps. Use when building UI with shadcn/ui components or extending the design system.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# shadcn/ui Patterns

> **Philosophy:** Own your components. No black boxes, no version lock-in.
> **Core Principle:** Compose primitives, don't fight abstractions.

---

## 🎯 Selective Reading Rule

| Section | When to Read |
|---------|-------------|
| Installation | New project setup |
| Theming | Custom brand colors, dark mode |
| Component Patterns | Building features with shadcn |
| Form Patterns | Complex forms with validation |
| Customization | Extending base components |

---

## Installation

```bash
# New Next.js project
npx shadcn@latest init

# Add components as needed (they live in your codebase)
npx shadcn@latest add button card dialog form input table
```

---

## Theme Configuration (Tailwind v4 + CSS Variables)

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Brand colors using OKLCH for perceptual uniformity */
  --color-primary:   oklch(0.55 0.22 250);   /* Brand blue */
  --color-secondary: oklch(0.70 0.15 140);   /* Brand green */
  --color-accent:    oklch(0.65 0.25 30);    /* Brand orange */

  /* shadcn/ui semantic tokens */
  --color-background:    oklch(1 0 0);
  --color-foreground:    oklch(0.15 0 0);
  --color-card:          oklch(1 0 0);
  --color-card-foreground: oklch(0.15 0 0);
  --color-border:        oklch(0.90 0 0);
  --color-ring:          var(--color-primary);

  /* Dark mode overrides */
  &:is(.dark *) {
    --color-background:  oklch(0.10 0 0);
    --color-foreground:  oklch(0.95 0 0);
    --color-card:        oklch(0.15 0 0);
    --color-border:      oklch(0.25 0 0);
  }
}
```

---

## Component Patterns

### Composition over Configuration

```tsx
// ✅ GOOD: Compose small primitives
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function ProductCard({ product }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <Badge variant={product.inStock ? 'default' : 'destructive'}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="font-bold">${product.price}</span>
        <Button disabled={!product.inStock}>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}
```

### Data Table Pattern

```tsx
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <Badge>{row.getValue('role')}</Badge>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];

// Usage
<DataTable columns={columns} data={users} searchKey="email" />
```

---

## Form Patterns (react-hook-form + zod + shadcn)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    // Submit data
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />  {/* Auto-shows validation errors */}
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Extending Components

```tsx
// components/ui/button.tsx — Add custom variant
// After running: npx shadcn@latest add button

import { cva } from 'class-variance-authority';

const buttonVariants = cva(/* base classes */, {
  variants: {
    variant: {
      // ... existing variants
      gradient: 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90',
      glass: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white',
    },
  },
});

// Usage
<Button variant="gradient">Get Started</Button>
```

---

## Dialog / Sheet Patterns

```tsx
// Controlled dialog with form
function DeleteUserDialog({ user, onDeleted }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deleteUser(user.id);
    onDeleted();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Overriding component styles with `!important` | Use `cn()` to extend className props |
| Installing shadcn components not in use | Only install what you need |
| Modifying node_modules shadcn files | Components live in `/components/ui/` — edit there |
| One giant Form component | Split into sub-forms with own schemas |
| Not using `asChild` for semantic HTML | Use `asChild` on Button/Link to avoid nested `<a><button>` |
