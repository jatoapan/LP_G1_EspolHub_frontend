import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { createAnnouncement } from "@/api/announcements";
import { getCategories } from "@/api/categories";
import { Category } from "@/types";

const publishSchema = z.object({
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
  location: z.string().min(3, "Ingresa una ubicación válida"),
});

type PublishFormData = z.infer<typeof publishSchema>;

const Publish = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const currentUser = user ? {
    name: user.attributes.name,
    avatar: undefined,
  } : undefined;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PublishFormData>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      condition: "good",
    },
  });

  const selectedCondition = watch("condition");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      toast.error("Máximo 5 imágenes permitidas");
      return;
    }

    const newFiles = Array.from(files);
    setImages((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagesPreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PublishFormData) => {
    if (images.length === 0) {
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

      await createAnnouncement({
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        condition: data.condition as ConditionKey,
        category_id: parseInt(category.id),
        location: data.location,
        images: images,
      });
      
      toast.success("¡Anuncio publicado exitosamente!");
      navigate("/profile?tab=listings");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al publicar el anuncio");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout isLoggedIn={false}>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Debes iniciar sesión para publicar</h1>
          <Button asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const LOCATIONS = [
    "Campus Gustavo Galindo",
    "Campus Prosperina",
    "FIEC",
    "FCNM",
    "FIMCP",
    "FCSH",
    "FADCOM",
    "Biblioteca",
    "Canchas ESPOL",
    "Otro",
  ];

  return (
    <Layout isLoggedIn={isAuthenticated} user={currentUser}>
      <div className="container py-6 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Publicar Anuncio</CardTitle>
            <CardDescription>
              Completa los detalles de tu artículo para publicarlo en EspolHub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Images Upload */}
              <div className="space-y-2">
                <Label>
                  Imágenes{" "}
                  <span className="text-muted-foreground">(máx. 5)</span>
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {imagesPreviews.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden bg-secondary"
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {imagesPreviews.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Añadir
                      </span>
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
                {images.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    La primera imagen será la portada de tu anuncio
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ej: Libro de Cálculo Thomas 14va Edición"
                  {...register("title")}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu artículo con el mayor detalle posible..."
                  rows={4}
                  {...register("description")}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
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
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger
                    className={errors.category ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.attributes.name}>
                        {category.attributes.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label>Condición</Label>
                <RadioGroup
                  value={selectedCondition}
                  onValueChange={(value) =>
                    setValue("condition", value as ConditionKey)
                  }
                  className="grid grid-cols-2 gap-3"
                >
                  {Object.entries(CONDITIONS).map(([key, label]) => (
                    <Label
                      key={key}
                      htmlFor={`condition-${key}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCondition === key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={key} id={`condition-${key}`} />
                      <span className="text-sm">{label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Select onValueChange={(value) => setValue("location", value)}>
                  <SelectTrigger
                    className={errors.location ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="¿Dónde entregas?" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-sm text-destructive">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Publicando..." : "Publicar Anuncio"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Publish;
