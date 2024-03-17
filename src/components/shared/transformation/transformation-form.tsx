"use client"
import { Button } from "@/components/ui/button"
import {
  Form
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateCredits } from "@/lib/actions/user.actions"
import { aspectRatioOptions, defaultValues, transformationTypes } from "@/lib/consts"
import { AspectRatioKey } from "@/lib/consts/aspectRatios"
import { debounce, deepMergeObjects } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import MediaUploader from "../media-uploader/media-uploader"
import TransformedImage from "../transformed-image/transformed-image"
import { FormCustomField } from "./form-custom-field"

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string()
})


const TransformationForm = ({ action, data = null, type, userId, creditBalance, config = null }: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data)
  const [newTransformation, setnewTransformation] = useState<Transformations | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [transformationConfig, setTransformationConfig] = useState(config)
  const [isPending, startTransition] = useTransition()

  const initialValues = data && action === 'Update' ? {
    title: data?.title,
    aspectRatio: data?.aspectRatio,
    color: data?.color,
    prompt: data?.prompt,
    publicId: data?.publicId
  } : defaultValues;
  
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: initialValues
    })
   
    function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values)
    }
    
    const onSelectFieldHandler = (field: string, onChange: (value: string) => void) => {
      const imageSize = aspectRatioOptions[field as AspectRatioKey];
      setImage((prevState:any) => ({ ...prevState, aspectRatio: imageSize.aspectRatio, width: imageSize.width, height: imageSize.height }))
      
      setnewTransformation(transformationType.config)
    }
    
    const onInputChangeHandler = (field: string, value: string, type: TransformationTypeKey, onChange: (value: string) => void) => {
      debounce(() => {
        setnewTransformation((prevState:any) => ({
          ...prevState,
          [type]: {
          ...prevState?.[type],
          [field === 'prompt' ? 'prompt': 'to']: value
        }
        }))
        return onChange(value)
      },1000)
  }    
  
    // TODO: RETURN TO UPDATE CREDITS
    const onTransformHandler = () => {
      setIsTransforming(true)
      deepMergeObjects(newTransformation, transformationConfig)
      setnewTransformation(null)
      startTransition(async () => {
        await updateCredits(userId, -1)
      })
    }
  
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormCustomField
            control={form.control}
            name="title"
            formLabel="Image Title"
            className="w-full"
            render={({ field }) => <Input {...field} className="input-field"/>}
          />
          {type === 'fill' && (
            <FormCustomField
              control={form.control}
              name="aspectRatio"
              formLabel="Aspect Ratio"
              className="w-full"
              render={({ field }) =>
                <Select
                onValueChange={(value: string) => onSelectFieldHandler(value, field.onChange)}
                >
                <SelectTrigger className="w-full border-2 border-purple-200/20 shadow-sm shadow-purple-200/15 rounded-[16px] h-[50px] md:h-[54px] text-dark-600 p-16-semibold disabled:opacity-100 placeholder:text-dark-400/50 px-4 py-3 focus:ring-offset-0 focus-visible:ring-transparent focus:ring-transparent focus-visible:ring-0 focus-visible:outline-none">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(aspectRatioOptions).map(key => (
                      <SelectItem key={key} value={key} className='py-3 cursor-pointer hover:bg-purple-100' >
                        {aspectRatioOptions[key as AspectRatioKey].label}
                      </SelectItem>
                  ))}
                </SelectContent>
            </Select>
            }
            />
          )}

          {(type === 'remove' || type==='recolor') && (
            <div className="flex flex-col gap-5 lg:flex-row lg:gap-10">
              <FormCustomField
                control={form.control}
                name='prompt'
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
                        field.onChange
                    )}
                  />
                )}
              />
              {type === 'recolor' && (
                <FormCustomField       
                  control={form.control}
                  name='color'
                  formLabel="Replacement Color"
                  className="w-full"
                  render={({ field }) => (
                    <Input value={field.value}
                    className="input-field"
                    onChange={(e) => 
                      onInputChangeHandler(
                        'color',
                        e.target.value,
                        'recolor',
                        field.onChange
                        )}
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
              />)}
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
            <Button type='button' className="bg-purple-gradient bg-cover rounded-full py-4 px-6 p-16-semibold h-[50px] w-full md:h-[54px] capitalize" disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
            >
            {isTransforming ? 'Transforming...' : 'Apply transformation'}
            </Button>
          <Button type='submit' className="bg-purple-gradient bg-cover rounded-full py-4 px-6 p-16-semibold h-[50px] w-full md:h-[54px] capitalize" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' :'Save image'}
            </Button>
          </div>

        </form>
      </Form>
    )
}

export default TransformationForm