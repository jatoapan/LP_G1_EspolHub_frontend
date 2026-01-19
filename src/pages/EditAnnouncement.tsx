import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Layout } from "@/components/layout/Layout";
import { CONDITIONS, ConditionKey } from "@/types/enums";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAnnouncement, updateAnnouncement } from "@/api/announcements";
import { getCategories } from "@/api/categories";
import { Category, Announcement } from "@/types";
import { getImageUrl } from "@/utils/imageUrl";

const editSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título no puede exceder 100 caracteres"),
  description: z
    .string()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(1000, "La descripción no puede exceder 1000 caracteres"),
  price: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Ingresa un precio válido",
    ),
  category: z.string().min(1, "Selecciona una categoría"),
  condition: z.string().min(1, "Selecciona una condición"),
});

type EditFormData = z.infer<typeof editSchema>;

const EditAnnouncement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagesPreviews, setNewImagesPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const currentUser = user ? {
    name: user.attributes.name,
    avatar: undefined,
  } : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  const selectedCondition = watch("condition");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsFetching(true);
      try {
        const [announcementData, categoriesData] = await Promise.all([
          getAnnouncement(Number(id)),
          getCategories(),
        ]);
        
        setAnnouncement(announcementData);
        setCategories(categoriesData);
        setExistingImages(announcementData.attributes.images || []);
        
        // Pre-fill form
        const attrs = announcementData.attributes;
        const category = categoriesData.find(c => 
          c.id === announcementData.relationships?.category?.data?.id
        );
        
        reset({
          title: attrs.title,
          description: attrs.description,
          price: String(attrs.price),
          condition: attrs.condition,
          category: category?.attributes.name || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar el anuncio");
        navigate("/profile?tab=listings");
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id, reset, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 5) {
      toast.error("Máximo 5 imágenes permitidas");
      return;
    }

    const newFiles = Array.from(files);
    setNewImages((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewImagesPreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagesPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditFormData) => {
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error("Añade al menos una imagen");
      return;
    }

    setIsLoading(true);
    try {
      const category = categories.find(c => c.attributes.name === data.category);
      if (!category) {
        toast.error("Categoría no válida");
        setIsLoading(false);
        return;
      }

      const payload: any = {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        condition: data.condition as ConditionKey,
        category_id: parseInt(category.id)
      }

      if (newImages.length > 0) {
        payload.images = newImages;
      }

      await updateAnnouncement(Number(id), payload);
      
      toast.success("¡Anuncio actualizado exitosamente!");
      navigate("/profile?tab=listings");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar el anuncio");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout isLoggedIn={false}>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Debes iniciar sesión</h1>
          <Button asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (isFetching) {
    return (
      <Layout isLoggedIn={isAuthenticated} user={currentUser}>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isLoggedIn={isAuthenticated} user={currentUser}>
      <div className="container py-6 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to="/profile?tab=listings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Editar Anuncio</CardTitle>
            <CardDescription>
              Modifica los detalles de tu anuncio
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Images */}
              <div className="space-y-3">
                <Label>Imágenes (máximo 5)</Label>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {/* Existing Images */}
                  {existingImages.map((img, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-border"
                    >
                      <img
                        src={getImageUrl(img)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* New Images Previews */}
                  {newImagesPreviews.map((preview, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary"
                    >
                      <img
                        src={preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  {existingImages.length + newImages.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Añadir</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título del anuncio</Label>
                <Input
                  id="title"
                  placeholder="Ej: iPhone 13 Pro Max 256GB"
                  {...register("title")}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu producto con el mayor detalle posible..."
                  rows={4}
                  {...register("description")}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Precio (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("price")}
                    className={`pl-7 ${errors.price ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.attributes.name}>
                        {cat.attributes.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              {/* Condition */}
              <div className="space-y-3">
                <Label>Condición</Label>
                <RadioGroup
                  value={selectedCondition}
                  onValueChange={(value) => setValue("condition", value)}
                  className="grid grid-cols-2 gap-3"
                >
                  {Object.entries(CONDITIONS).map(([key, label]) => (
                    <div key={key}>
                      <RadioGroupItem
                        value={key}
                        id={key}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={key}
                        className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-colors"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Guardando cambios..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditAnnouncement;
