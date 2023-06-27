import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import styles from './index.module.css';
//@ts-ignore
import {CreatePasswordParams, Fields, Common} from './index';
import { useState, FormEvent } from 'react';
//@ts-ignore
import {ValidationType, ValidationSchemaType, validationSchema, validationFields,} from '../SignupForm/validation';

const createPasswordFields = {
  password: '',
}

const CreatePasswordForm = (
  {
    createPasswordHandler,
    onFormChange,
    error = false,
    errorMessage
  }: {
    createPasswordHandler(createPasswordHandler: CreatePasswordParams): void,
    onFormChange: (e?: any) => void;
    error?: boolean,
    errorMessage?: string
  }) => {
  const [fields, setFields] = useState<Fields>(createPasswordFields)
  const [validation, setValidation] = useState<ValidationType>(validationFields)
  const [common, setCommon] = useState<Common>({ isSubmitting: false, passwordConfirm: '' })
  const validateField = (data: Fields) => async (field: string) => { 
    // @ts-ignore
    const isValid = (validationSchema[field as keyof ValidationSchemaType].isValidSync(data[field as keyof Fields], {context: {...fields}}));
    setValidation((fields:ValidationType) => ({
      ...fields,
      [field]: isValid
    }))
    return isValid
  }
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true
    for (const fieldName in fields) {
      isValid = await validateField(fields)(fieldName) || false
    }
    if (isValid) {
      setCommon((common:Common) => ({ ...common, isSubmitting: true }));
      await createPasswordHandler(fields);
      setCommon((common:Common) => ({ ...common, isSubmitting: false }));
    }
  }
  return (
    <div className="create-password-form">
      <Box sx={{ p: 5, mx: "auto", my: 10 }} className={styles['create-password-form-container']}>
        <Box className={styles['create-password-form-title']} sx={{ mb: 3 }}>
          <Typography variant="h3" component="h3">
            Create password
          </Typography>
        </Box>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          {
            error &&
            <Typography variant="body1" my={2} className={styles['sign-in-error-container']}>
              {errorMessage}
            </Typography>
          }
          <Grid container columnSpacing={2}>
            <Grid item xs={12} md={12}>
              <TextField
                id="password"
                name="password"
                label="Password"
                required
                type="password"
                fullWidth
                autoComplete="password"
                value={fields.password}
                margin="normal"
                disabled={common.isSubmitting}
                error={!validation.password}
                helperText={!validation.password ? 'The password is too short. The password should be at least 8 symbols.' : ''}
                onBlur={() => validateField(fields)('password')}
                onChange={(e) => { onFormChange(e); setFields((fields:CreatePasswordParams) => ({ ...fields, password: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                id="confirm-password"
                name="confirm-password"
                label="Confirm password"
                required
                type="password"
                fullWidth
                autoComplete="confirm-password"
                value={common.passwordConfirm}
                margin="normal"
                disabled={common.isSubmitting}
                error={!validation.passwordConfirm}
                helperText={!validation.password ? 'The password is too short. The password should be at least 8 symbols.' : ''}
                onBlur={() => validateField(common as any)('passwordConfirm')}
                onChange={(e) => { onFormChange(e); setCommon((fields:Common) => ({ ...fields, passwordConfirm: e.target.value })) }}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={common.isSubmitting}
            sx={{ my: 2 }}
          >
            {
              common.isSubmitting ?
                <CircularProgress size={24} /> :
                "Create"
            }
          </Button>
        </Box>
      </Box>
    </div>
  )
};

export default CreatePasswordForm;