// components/admin/blog/BlogForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import { ArticleBody } from "@/components/shared/ArticleBody";
import {
  FormFooter,
  FormSection,
  LinesField,
  SelectField,
  SwitchField,
  applyActionError,
} from "@/components/admin/forms/fields";
import { ImageField } from "@/components/admin/forms/ImageField";
import { BLOG_TOPICS } from "@/config/blog";
import { blogSchema } from "@/lib/validations/blog";
import { createPost, updatePost } from "@/app/actions/admin/blog";

const defaults = (p, author) => ({
  title: p?.title ?? "",
  slug: p?.slug ?? "",
  excerpt: p?.excerpt ?? "",
  content: p?.content ?? "",
  category: p?.category ?? "",
  tags: (p?.tags ?? []).join("\n"),
  authorName: p?.authorName ?? author ?? "",
  coverImage: p?.coverImage ?? "",
  seoTitle: p?.seoTitle ?? "",
  seoDescription: p?.seoDescription ?? "",
  featured: !!p?.featured,
});

export function BlogForm({ record = null, defaultAuthor }) {
  const router = useRouter();
  const edit = !!record;
  const form = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: defaults(record, defaultAuthor),
  });
  const content = useWatch({ control: form.control, name: "content" });

  async function onSubmit(values) {
    const res = edit
      ? await updatePost({
          currentSlug: record.slug,
          ifUpdatedAt: record.updatedAt,
          values,
        })
      : await createPost(values);
    if (!res.ok) return applyActionError(res, form, toast);
    toast.success(
      edit ? "Post updated successfully." : "Post created successfully.",
    );
    router.push(`/admin/blog/${res.data.slug}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <FormSection title="Basics">
        <TextField
          control={form.control}
          name="title"
          label="Title"
          autoComplete="off"
        />
        <TextField
          control={form.control}
          name="slug"
          label="Slug"
          autoComplete="off"
          description={
            edit
              ? "Changing the slug keeps the old URL working through a redirect."
              : "Leave blank to generate it from the title."
          }
        />
        <TextField
          control={form.control}
          name="excerpt"
          label="Excerpt"
          component={Textarea}
          rows={3}
          description="20–300 characters. Shown on cards and in search results."
        />
      </FormSection>

      <FormSection
        title="Content"
        description="Plain text. One paragraph per line. Start a line with ## for a heading, ### for a subheading, or - for a bullet."
      >
        <Tabs defaultValue="write">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="pt-4">
            <TextField
              control={form.control}
              name="content"
              label="Article body"
              component={Textarea}
              rows={18}
              className="font-mono text-sm"
            />
          </TabsContent>
          <TabsContent value="preview" className="pt-4">
            {content?.trim() ? (
              <div className="rounded-lg border bg-card p-5">
                <ArticleBody text={content} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing to preview yet.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </FormSection>

      <FormSection title="Classification">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="category"
            label="Topic"
            placeholder="Choose a topic"
            options={BLOG_TOPICS.map((t) => ({
              value: t.label,
              label: t.label,
            }))}
          />
          <TextField
            control={form.control}
            name="authorName"
            label="Author name"
          />
        </div>
        <LinesField
          control={form.control}
          name="tags"
          label="Tags"
          rows={3}
          description="One per line. Saved as lowercase-with-hyphens."
        />
      </FormSection>

      <FormSection title="Cover image">
        <ImageField
          control={form.control}
          name="coverImage"
          label="Cover image"
          kind="blog"
          description="16:9 works best. Required to publish."
        />
      </FormSection>
      <FormSection title="SEO">
        <TextField
          control={form.control}
          name="seoTitle"
          label="SEO title"
          description="Up to 70 characters. Defaults to the post title."
        />
        <TextField
          control={form.control}
          name="seoDescription"
          label="SEO description"
          component={Textarea}
          rows={2}
          description="Up to 160 characters. Defaults to the excerpt."
        />
      </FormSection>
      <FormSection title="Settings">
        <SwitchField
          control={form.control}
          name="featured"
          label="Featured"
          description="Marks the post as featured. Public pages can use this later."
        />
      </FormSection>
      <FormFooter
        submitting={form.formState.isSubmitting}
        cancelHref={edit ? `/admin/blog/${record.slug}` : "/admin/blog"}
        submitLabel={edit ? "Save changes" : "Create post"}
      />
    </form>
  );
}

