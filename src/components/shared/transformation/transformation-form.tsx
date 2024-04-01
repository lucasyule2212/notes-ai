'use client'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addImage, updateImage } from '@/lib/actions/image.actions'
import { updateCredits } from '@/lib/actions/user.actions'
import {
  aspectRatioOptions,
  defaultValues,
  transformationTypes,
} from '@/lib/consts'
import { AspectRatioKey } from '@/lib/consts/aspectRatios'
import { debounce, deepMergeObjects } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { getCldImageUrl } from 'next-cloudinary'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { InsufficientCreditsModal } from '../insuficient-credits-modal/insuficient-credits-modal'
import MediaUploader from '../media-uploader/media-uploader'
import TransformedImage from '../transformed-image/transformed-image'
import { FormCustomField } from './form-custom-field'

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
})

const TransformationForm = ({
  action,
  data = null,
  type,
  userId,
  creditBalance,
  config = null,
}: TransformationFormProps) => {
  const transformationType = transformationTypes[type]
  const [image, setImage] = useState(data)
  const [newTransformation, setNewTransformation] =
    useState<Transformations | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [transformationConfig, setTransformationConfig] = useState(config)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const initialValues =
    data && action === 'Update'
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    if (data || image) {
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig,
      })

      const imageData = {
        title: values.title,
        publicId: image?.publicId,
        transformationType: type,
        width: image?.width,
        height: image?.height,
        config: transformationConfig,
        secureURL: image?.secureURL,
        transformationURL: transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
      }

      if (action === 'Add') {
        try {
          const newImage = await addImage({
            image: imageData,
            userId,
            path: '/',
          })
          if (newImage) {
            form.reset()
            setImage(data)
            router.push(`/transformations/${newImage._id}`)
          }
        } catch (error) {
          console.log(error)
        }
      }
      if (action === 'Update') {
        try {
          const updatedImage = await updateImage({
            image: {
              ...imageData,
              _id: data?._id,
            },
            userId,
            path: `/transformations/${data._id}`,
          })
          if (updatedImage) {
            router.push(`/transformations/${updatedImage._id}`)
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
    setIsSubmitting(false)
  }

  const onSelectFieldHandler = (
    field: string,
    onChange: (value: string) => void,
  ) => {
    const imageSize = aspectRatioOptions[field as AspectRatioKey]
    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }))

    setNewTransformation(transformationType.config)

    return onChange(field)
  }

  const onInputChangeHandler = (
    field: string,
    value: string,
    type: TransformationTypeKey,
    onChange: (value: string) => void,
  ) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [field === 'prompt' ? 'prompt' : 'to']: value,
        },
      }))
    }, 1000)()
    return onChange(value)
  }

  const onTransformHandler = () => {
    setIsTransforming(true)
    setTransformationConfig(
      deepMergeObjects(newTransformation, transformationConfig),
    )
    setNewTransformation(null)
    startTransition(async () => {
      await updateCredits(userId, -1)
    })
  }

  useEffect(() => {
    if (image && (type === 'restore' || type === 'removeBackground')) {
      setNewTransformation(transformationType.config)
    }
  }, [image, transformationType.config, type])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(-1) && <InsufficientCreditsModal />}
        <FormCustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />
        {type === 'fill' && (
          <FormCustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value: string) =>
                  onSelectFieldHandler(value, field.onChange)
                }
                value={field.value}
              >
                <SelectTrigger className="p-16-semibold h-[50px] w-full rounded-[16px] border-2 border-purple-200/20 px-4 py-3 text-dark-600 shadow-sm shadow-purple-200/15 placeholder:text-dark-400/50 focus:ring-transparent focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent disabled:opacity-100 md:h-[54px]">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="cursor-pointer py-3 hover:bg-purple-100"
                    >
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="flex flex-col gap-5 lg:flex-row lg:gap-10">
            <FormCustomField
              control={form.control}
              name="prompt"
              formLabel={
                type === 'remove' ? 'Object to remove' : 'Object to recolor'
              }
              className="w-full"
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  onChange={(e) =>
                    onInputChangeHandler(
                      'prompt',
                      e.target.value,
                      type,
                      field.onChange,
                    )
                  }
                />
              )}
            />
            {type === 'recolor' && (
              <FormCustomField
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    className="input-field"
                    onChange={(e) =>
                      onInputChangeHandler(
                        'color',
                        e.target.value,
                        'recolor',
                        field.onChange,
                      )
                    }
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="grid h-fit min-h-[200px] grid-cols-1 gap-5 py-4 md:grid-cols-2">
          <FormCustomField
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader
                onValueChange={field.onChange}
                setImage={setImage}
                image={image}
                publicId={field.value}
                type={type}
              />
            )}
          />

          <TransformedImage
            image={image}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          />
        </div>

        <div className="flex w-full gap-4">
          <Button
            type="button"
            className="p-16-semibold h-[50px] w-full rounded-full bg-purple-gradient bg-cover px-6 py-4 capitalize md:h-[54px]"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
          >
            {isTransforming ? 'Transforming...' : 'Apply transformation'}
          </Button>
          <Button
            type="submit"
            className="p-16-semibold h-[50px] w-full rounded-full bg-purple-gradient bg-cover px-6 py-4 capitalize md:h-[54px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Save image'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default TransformationForm
